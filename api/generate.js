const Koa = require("koa");
const bodyParser = require("koa-bodyparser");
const { Configuration, OpenAIApi } = require("openai");

const app = new Koa();

// Middleware for parsing request body
app.use(bodyParser());

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
  basePath: "https://api.openai.iniad.org/api/v1",
});
const openai = new OpenAIApi(configuration);

const systemText = {
  role: "system",
  content: `日本語で返答してください。...`,
};

app.use(async (ctx) => {
  if (ctx.method === "POST" && ctx.path === "/api/generate") {
    const user = ctx.request.body.user || "";

    if (!user || user.trim().length === 0) {
      ctx.status = 400;
      ctx.body = { error: { message: "Please enter a message." } };
      return;
    }

    try {
      const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [systemText, { role: "user", content: `${user}` }],
        temperature: 0,
      });
      
      ctx.status = 200;
      ctx.body = { result: completion.data.choices[0].message };
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: { message: "An error occurred during your request." } };
    }
  } else {
    ctx.status = 404;
    ctx.body = { error: { message: "Not Found" } };
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
