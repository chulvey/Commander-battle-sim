import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

let requests = [];

function rateLimit(req, res, next) {

const now = Date.now();

requests = requests.filter(t => now - t < 60000);

if (requests.length >= 6) {
return res.json({
message: "One minute. Judge currently answering other calls."
});
}

requests.push(now);

next();
}

app.post("/judge", rateLimit, async (req, res) => {

try {

const question = req.body.question;

const response = await fetch("https://api.openai.com/v1/chat/completions", {

method: "POST",

headers: {
"Content-Type": "application/json",
"Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
},

body: JSON.stringify({

model: "gpt-4o-mini",

messages: [
{
role: "system",
content:
"You are a Magic: The Gathering judge. Provide a ruling, explanation, rule reference, and suggested fix."
},
{
role: "user",
content: question
}
]

})

});

const data = await response.json();

res.json({
answer: data.choices[0].message.content
});

} catch (err) {

res.json({
message: "judge offline"
});

}

});

app.listen(PORT, () => {
console.log("Judge server running");
});
