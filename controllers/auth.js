const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

//database configuration
const database = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

//connecting into database
database.connect((err) => {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    } else {
        console.log('mysql connected/auth.js Line:19');
    }
});

//Admin login export
exports.adminLogin = (req, res) => {
    const {
        email,
        password
    } = req.body;

    if (!email || !password) {
        return res.status(400).render('index', {
            message: 'Please enter your Email and Password'
        });
    }
    database.query(`select * from admin where email = ?`, [email], async (err, results) => {

        if (results.length === 0 || password !== results[0].password) {
            res.status(401).render('index', {
                message: 'Email or Password is incorrect'
            });
        } else {
            const id = results[0].adminId;
            const token = jwt.sign({
                id
            }, process.env.JWT_SECRET, {
                expiresIn: process.env.JWT_EXPIRESIN
            });

            //Displaying session expire
            const cookieToken = {
                expire: new Date(
                    Date.now() + process.env.COOKIE_EXPIRES * 86400000 * 2
                ),
                httpOnly: true
            };
            res.cookie('User Cookie', cookieToken);

            //Display all users
            database.query(`select * from student`, (err, results) => {
                if (err) {
                    throw err;
                } else {
                    res.redirect('/auth/dashboard');
                }
            });
        }
    });
};

//Student dashboard export
exports.dashboard = (req, res) => {
    database.query(`select * from student`, (err, results) => {
        if (err) {
            throw err;
        } else {
            return res.render('dashboard', {
                title: 'Enrollees',
                student: results
            });
        }
    });
};

//Student register export
exports.register = (req, res) => {
    database.query(`select * from student`, (err, results) => {
        if (err) {
            throw err;
        } else {
            res.render('registration', {
                title: 'Enrollees',
                student: results
            });
        }
    });
};

exports.registerStudent = (req, res) => {
    // console.log(req.body);
    const {
        fName,
        lName,
        email,
        password,
        confirmPassword
    } = req.body;

    database.query(`select email from student where email = ?`, [email], async (err, results) => {
        if (err) {
            throw err;
        } else if (results.length > 0) {
            return res.render('registration', {
                message: 'Email entered is already in use'
            });
        } else if (password !== confirmPassword) {
            return res.render('registration', {
                message: 'Password entered do not match'
            });
        } else if (fName === "" || lName === "" || email === "") {
            return res.render('registration', {
                message: 'Please Complete the Form'
            });
        } else {

            let encPass = await bcrypt.hash(password, 10);
            // console.log(encPass);

            database.query(`insert into student set ?`, {
                studentId: Date.now(),
                fName: fName,
                lName: lName,
                email: email,
                password: encPass
            }, (err) => {
                if (err) {
                    throw err;
                } else {
                    return res.render('registration', {
                        messageSuccess: 'User Registered Successfully!',
                    });
                }
            });
        }
    });
};

//Student update export
exports.update = (req, res) => {
    const email = req.params.email;
    database.query(`select studentId, fName, lName, email from student where email = ?`, [email], (err, results) => {
        if (err) {
            throw err;
        } else {
            return res.render('update', {
                title: 'Edit User',
                student: results[0]
            });
        }
    });
};

exports.updateUser = (req, res) => {
    const {
        studentId,
        fName,
        lName,
        email
    } = req.body;
    database.query(`update student set fName = "${fName}", lName = "${lName}", email = "${email}" where studentId = "${studentId}"`, (err, results) => {
        if (err) {
            throw err;
        } else {
            database.query(`select * from student`, (err, results) => {
                if (err) {
                    throw err;
                } else {
                    return res.render('dashboard', {
                        student: results
                    });
                }
            });
        }
    });
};

//Student delete export
exports.delete = (req, res) => {
    const email = req.params.email;
    database.query(`select * from student where email = ?`, [email], (err, results) => {
        if (err) {
            throw err;
        } else {
            return res.render('delete', {
                title: 'Delete User Information',
                student: results[0]
            })
        }
    })
};

exports.deleteUser = (req, res) => {
    const {
        studentId,
        confirmUserId,
    } = req.body;
    database.query(`delete from student where studentId="${confirmUserId}"`, (err, results) => {
        if (err) {
            throw err;
        } else if (studentId !== confirmUserId) {
            database.query(`select studentId, fName, lName, email from student where studentId = ${studentId}`, (err, results) => {
                if (err) {
                    throw err;
                } else {
                    return res.render('delete', {
                        title: 'Delete User Information',
                        message: 'Confirmed User ID do not match',
                        student: results[0]
                    });
                }
            });
        } else {
            database.query(`select * from student`, (err, results) => {
                if (err) {
                    throw err;
                } else {
                    return res.render('dashboard', {
                        student: results
                    });
                }
            });
        }
    });
};