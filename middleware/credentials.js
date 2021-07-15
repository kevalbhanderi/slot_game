// class Verify {
//     credentials(req, res, next) {
//         const email = req.body.email;
//         const password = req.body.password;

//         let emailFormat = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
//         let passwordFormat = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

//         if (!emailFormat.exec(email)) {
//             let error_msg = "Email is not valid";
//             return res.render('signup', { error_msg: error_msg });
//         }
//     }
// }

// const credentials = new Verify();
// module.exports.verify = credentials;