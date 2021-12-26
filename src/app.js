const path = require('path')
const express = require('express')
const hbs = require('hbs')
const fs = require('fs')
const validator = require('validator');
require('dotenv').config()


const app = express()
const port = process.env.PORT || 3001


// Defines paths for hbs
const viewsPath = path.join(__dirname, '../templates/views')
const partialsPath = path.join(__dirname, '../templates/partials')

// Setup hbs
app.set('view engine', 'hbs')
app.set('views', viewsPath)
hbs.registerPartials(partialsPath)

app.use(express.static('public'));


app.get('', (req, res) => {
    res.render('index')
})

app.get('/credits', (req, res) => {
    res.render('credits')
})

app.get('/who', (req, res) => {
    res.render('who')
})

app.get('/contact', (req, res) => {
    res.render('contact')
})

app.get('/send-email', (req, res) => {
    const email = req.query.email
    const message = req.query.message
    const name = req.query.name
    if (!name) {
        return res.send({
            success: false,
            message: 'A field was either missing or left blank.'
        })
    } else if (!message){
        return res.send({
            success: false,
            message: 'A field was either missing or left blank.'
        })
    } else if (!email){
        return res.send({
            success: false,
            message: 'A field was either missing or left blank.'
        })
    }
    if (validator.isEmail(email) === false) {
        return res.send({
            success: false,
            message: 'Your email is not valid.'
        })
    }





    const confirmationHTML = fs.readFileSync('src/confirmsent.html', 'utf-8')
    const toGeorgeHTML = 'Name: ' + name + ' Message: ' + message + ' From: ' + email

    const sendMessage = (email, message, html, name, subject, callback) => {

        const sgMail = require('@sendgrid/mail')
        sgMail.setApiKey(process.env.SENDGRID_API_KEY) // process.env.SENDGRID_API_KEY
        const msg = {
            to: email, // Change to your recipient
            from: {
              email: 'noreply@georgetong.uk',
              name: '< George Tong />'
            },
            subject: subject,
            text: message,
            html: html,

        }
        sgMail
            .send(msg)
            .then(() => {
                callback()
                console.log('Message successfully sent to ' + email)
            })
            .catch((error) => {
                res.send({
                    success: false,
                    message: error.response.body.errors[0].message
                })
            })

    }
    const sendConfirmation = () => {
        sendMessage(email, 'Email has been sent to George', confirmationHTML, name, 'Email sent.', declareConfirmation)
    }
    const sendToGeorge = () => {
        sendMessage('me@georgetong.uk', toGeorgeHTML, toGeorgeHTML, name,'Email from form.', sendConfirmation)
    }
        const declareConfirmation = () => {
        res.send({
            success: true,
            message: 'Message successfully sent.'
        })
    }
    sendToGeorge()
})

app.get('/work', (req, res) => {
        const parsedJSON = {
            work: {
                movieRater: {
                    title: 'MovieRater',
                    description: 'Rate movies!',
                    dataDate: '2020-08-31',
                    date: '31st August 2020',
                    url: 'https://movierater.georgetong.uk',
                    img: '/img/app-icons/MovieRater.png'
                },
                weatherApp: {
                    title: 'GeoWeather',
                    description: 'Get the weather!',
                    dataDate: '2020-10-07',
                    date: '7th November 2020',
                    url: 'https://weather.georgetong.uk',
                    img: '/img/app-icons/GeoWeather.png'
                },
                chatApp: {
                    title: 'ChatApp',
                    description: 'Simple app for chatting!',
                    dataDate: '2021-02-05',
                    date: '5th January 2021',
                    url: 'https://chatapp.georgetong.uk',
                    img: '/img/app-icons/ChatApp.png'
                }
            }
        }
        res.render('work', {
            work: parsedJSON
        })
    })


app.get('/*', (req, res) => {
    res.render('404')
})


app.listen(port, () => {
    console.log('Server is up on port ' + port + ' .')
})