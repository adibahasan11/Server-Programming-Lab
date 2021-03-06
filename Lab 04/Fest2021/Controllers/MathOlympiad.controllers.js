const MathOlympiad = require("../Models/MathOlympiad.model");

var uuid = require('uuid');

var LocalStorage = require('node-localstorage').LocalStorage;
const localStorage = new LocalStorage('./LocalStorage');

const username = localStorage.getItem("username");

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.Email,
        pass: process.env.Password
    }
});

const getRegisterMO = (req, res) =>{
    res.render("Math-Olympiad/Register.ejs", { username: username, error: req.flash("error") });
}

const postRegisterMO = (req, res) =>{
    const { name, category, contact, email, institution, tshirt } = req.body;
    let error = "";

    console.log(name);
    console.log(category);
    console.log(contact);
    console.log(email);
    console.log(institution);
    console.log(tshirt);

    let registrationFee = 0;
    if (category == "School") {
        registrationFee = 250;
    }
    else if (category == "College") {
        registrationFee = 400;
    } 
    else {
        registrationFee = 500;
    }

    const total = registrationFee;
    const paid = 0;
    const selected = false;
    
    var verificationCode = uuid.v1();
    console.log(verificationCode);

    MathOlympiad.findOne({ name: name, contact: contact }).then( (participant) => {
        if (participant) {
            error = "Participant already exists with this name and contact number.";

            req.flash("error", error);
            res.redirect("Register");
        }
        else {
            const participant = new MathOlympiad({
                name : name,
                category : category,
                contact : contact,
                email : email,
                institution : institution,
                total : total,
                paid : paid,
                selected : selected,
                tshirt : tshirt,
                verificationCode : verificationCode,
            });

            participant
                .save()
                .then(() => {
                    console.log("Participant Added: " + name);
                    error = "Participant Added Successfully"

                    console.log(email);
                    const options = {
                        to: email,
                        from: "ictfest2021@gmail.com",
                        subject: "Registration is Successful!",
                        text: "Dear " + name + ", \n" + 
                        "Congratulations! Your Registration to Math Olympiad in ICT Fest, 2021 is successful.\n" 
                        + "Your unique code is " + verificationCode + "."
                    }

                    transporter.sendMail(options, function(err, info){
                        if (err){
                            console.log(err);
                            return;
                        }
                        console.log("Sent: " + info.response);
                    }); 
                    
                    req.flash("error", error);
                    res.redirect('Register');
                })
                .catch((err)=>{
                    console.log(err)
                    error = "An Unexpected Error while Creating New User.";

                    req.flash("error", error);
                    res.redirect("Register");
                });
        }
    })
}

const getMOList = (req, res) =>{
    let Participants = [];
    let error = "";

    MathOlympiad.find().then((data) => {
        Participants = data;

        res.render("Math-Olympiad/List.ejs", { 
            username: username,
            participants: Participants,
            error: req.flash("error"),
        });
    })
    .catch(() => {
        error = "An Unexpected Error occured while fetching data."

        res.render("Math-Olympiad/List.ejs", { 
            username: username,
            participants: Participants,
            error: req.flash("error", error),
        });
    })
}

const getEditMO = (req, res) =>{
    const id = req.params.id;
    let Participant = [];
    let error = ''

    console.log(id);

    MathOlympiad.findOne({ _id: id }).then((data) => {
        Participant = data;

        res.render("Math-Olympiad/Edit.ejs", { 
            username: username,
            participant: Participant,
            error: req.flash("error"),
        });
    })
    .catch(() => {
        error = "An Unexpected Error occured while fetching data."

        res.render("Math-Olympiad/Edit.ejs", { 
            username: username,
            participant: Participant,
            error: req.flash("error", error),
        });
    })
    
}

const postEditMO = (req, res) =>{
    const id = req.params.id;
    let error = ''

    console.log(id);

    MathOlympiad.findOne({ _id: id }).then( (participant) => {
        if (participant) {
            const { name, category, contact, email, institution, tshirt } = req.body;

            let registrationFee = 0;
            if (category == "School") {
                registrationFee = 250;
            }
            else if (category == "College") {
                registrationFee = 400;
            } 
            else {
                registrationFee = 500;
            }
            
            participant.name = name;
            participant.category = category;
            participant.contact = contact;
            participant.email = email;
            participant.institution = institution;
            participant.tshirt = tshirt;
            participant.total = registrationFee;

            participant.save().then(()=>{
                error = "Participant Data was edited successfully.";
                req.flash('error', error);
    
                console.log(error);
                res.redirect('/MathOlympiad/Participant-list');
            }).catch(()=>{
                error = "Unknown Error occured and Data was not Edited."
                req.flash('error', error);
    
                console.log(error);
                res.redirect('/MathOlympiad/Participant-list');
            });
        }
        else {
            error = "Unknown Error occured and Data was not Edited."
            req.flash('error', error);
    
            console.log(error);
            res.redirect('/MathOlympiad/Participant-list');
        }
    })
}

const deleteMO = (req, res) =>{
    const id = req.params.id;
    let error = ''

    console.log(id);

    MathOlympiad.deleteOne({ _id: id }, (err) =>{
        if (err) {
            error = "Failed to delete data."
            req.flash('error', error);

            res.redirect('/MathOlympiad/Participant-list');
        }
        else{
            error = "Data Successfully deleted."
            req.flash('error', error);

            res.redirect('/MathOlympiad/Participant-list');
        }
    });
}

const paymentDone = (req, res) =>{
    const id = req.params.id;
    let error = ''

    console.log(id);
    console.log("I am here");

    MathOlympiad.findOne({ _id: id }).then((participant)=> {
        participant.paid = participant.total;
        
        participant.save().then(()=>{
            error = "Payment Accepted Successfully."
            req.flash('error', error);

            console.log(error);
            res.redirect('/MathOlympiad/Participant-list');
        }).catch(()=>{
            error = "Unknown Error occured and Payment was denied."
            req.flash('error', error);

            console.log(error);
            res.redirect('/MathOlympiad/Participant-list');
        });
        }).catch(()=>{
        error = "Unknown Error occured and Participant was not found."
        req.flash('error', error);

        console.log(error);
        res.redirect('/MathOlympiad/Participant-list');
    })
}

const participantSelected = (req, res) =>{
    const id = req.params.id;
    let error = ''

    console.log(id);
    console.log("I am hereee");

    MathOlympiad.findOne({ _id: id }).then((participant)=> {
        participant.selected = true;
        
        participant.save().then(()=>{
            error = "Participant Selected Successfully."
            req.flash('error', error);

            if (!participant.selected) {
                const options = {
                    to: participant.email,
                    from: "ictfest2021@gmail.com",
                    subject: "You have been Selected!",
                    text: "Dear " + participant.name + ", \n" + 
                        "Congratulations! Your have been selected for the Math Olympiad in ICT Fest, 2021."
                }

                transporter.sendMail(options, function(err, info){
                    if (err){
                        console.log(err);
                        return;
                    }
                    console.log("Sent: " + info.response);
                });
            }

            console.log(error);
            res.redirect('/MathOlympiad/Participant-list');
        }).catch(()=>{
            error = "Unknown Error occured and Participant was not Selected."
            req.flash('error', error);

            console.log(error);
            res.redirect('/MathOlympiad/Participant-list');
        });
        }).catch(()=>{
        error = "Unknown Error occured and Participant was not found."
        req.flash('error', error);

        console.log(error);
        res.redirect('/MathOlympiad/Participant-list');
    })
}

module.exports = { getRegisterMO, getMOList, postRegisterMO, deleteMO, paymentDone, participantSelected, getEditMO, postEditMO };