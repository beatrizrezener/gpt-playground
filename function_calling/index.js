import 'dotenv/config'; 

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // default value, just being explicit
});

function greet(name) {
  return 'Hello, ' + name + '!';
}

async function runConversation() {
  // Step 1: send the conversation and available functions to GPT
  const messages = [{
    role: "system",
    content: "Perform function requests for the user",
  },
  {
    role: "user",
    content: "Hello, I am a user, I would like to call the greet  function passing the string 'Beatriz' to it",
  }];
    
  const functions = [{
    "name": "greet",
    "description": "Prints a greeting message with the string passed to it",
    "parameters": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string",
            "description": "The string to append to the greeting message"
          },
        },
        "required": ["name"],
    },
  }];

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: messages,
    functions: functions,
    function_call: "auto", // default value, just being explicit
  });

  const responseMessage = response.choices[0].message;

  // Step 2: check if GPT wanted to call a function
  if (responseMessage.function_call) {
    // Step 3: call the function
    const availableFunctions = {
      greet: greet,
    }; // only one function in this example, but it could have multiple
    const functionName = responseMessage.function_call.name;
    const functionToCall = availableFunctions[functionName];
    const functionArgs = JSON.parse(responseMessage.function_call.arguments);
    const functionResponse = functionToCall(
        functionArgs.name,
    );

    // Step 4: send the info on the function call and function response to GPT
    messages.push(responseMessage);  // extend conversation with assistant's reply
    messages.push({
      "role": "function",
      "name": functionName,
      "content": functionResponse,
    }); // extend conversation with function response
    const secondResponse = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: messages,
    }); // get a new response from GPT where it can see the function response
    return secondResponse;
  }
}

runConversation().then(console.log).catch(console.error);