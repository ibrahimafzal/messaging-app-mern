const express = require("express")
const cors = require("cors")

const authRoute = require("./routes/auth.js")
const { error, log } = require("console")

const app = express()

const PORT = process.env.PORT || 5000

require("dotenv").config()

const accoundSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const twilioClient = require("twilio")(accoundSid, authToken)
const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID

app.use(cors())

app.use(express.json())
app.use(express.urlencoded())

app.get("/", (req, res) => {
    res.send("Hello Server")
})

app.use("/auth", authRoute)

app.post("/", (req, res) => {
    const { message, user: sender, type, members } = req.body

    if (type === "message.new") {
        members
            .filter((member) => member.user_id !== sender.id)
            .forEach(({ user }) => {
                if (!user.online) {
                    twilioClient.messages.create({
                        body: `You have a new message from ${message.user.fullName} - ${message.text}`,
                        messagingServiceSid: messagingServiceSid,
                        to: user.phoneNumber
                    })
                        .then(() => { console.log('Message sent!'); })
                        .catch((error) => console.log(error))
                }
            })

            return res.status(200).send("Message sent!")
    }

    return res.status(200).send("Not a new message request")
})


app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
})