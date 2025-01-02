


const cors = require('cors');
const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.urlencoded({limit: '5mb', extended: true}));
app.use(express.json())
app.use(cors({
  Credential: true,
  origin: ['https://vboard-vedant.vercel.app', 'http://localhost:5173']
}))

const aiKey = "AIzaSyBG6zjR6SAc2UfODa_8BIMvKmrfk8QT7hc";

const genAI = new GoogleGenerativeAI(aikey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

function base64UrlToBase64(base64Url) {
  const base64 = base64Url.replace(/^data:image\/png;base64,/, '');

  let base64Standard = base64.replace(/-/g, '+').replace(/_/g, '/');

  while (base64Standard.length % 4 !== 0) {
      base64Standard += '=';
  }

  return base64Standard;
}


app.post('/calculate', async (req, res) => {
  const {image:img} = req?.body;

  const base64 = base64UrlToBase64(img);
  const imageBuffer = Buffer.from(base64, 'base64');

  const image = {
    inlineData: {
      data: Buffer.from(imageBuffer).toString('base64'),
      mimeType: 'image/png'
    }
  }
  // const prompt = 'In this image a mathematical equation is given, it can be a simple equation or it can be a linear equation, solve the equation accordingly and return only the last step of the equation in the case of simple equation and return only the last and the first steps in the case of linear equation'
  const prompt = "always remember to give short answer. You have been given an image with some mathematical expressions, equations, or graphical problems, and you need to solve them. Note: Use the PEMDAS rule for solving mathematical expressions. PEMDAS stands for the Priority Order: Parentheses, Exponents, Multiplication and Division (from left to right), Addition and Subtraction (from left to right). Parentheses have the highest priority, followed by Exponents, then Multiplication and Division, and lastly Addition and Subtraction. For example: Q. 2 + 3 * 4 (3 * 4) => 12, 2 + 12 = 14. Q. 2 + 3 + 5 * 4 - 8 / 2 5 * 4 => 20, 8 / 2 => 4, 2 + 3 => 5, 5 + 20 => 25, 25 - 4 => 21. YOU CAN HAVE FIVE TYPES OF EQUATIONS/EXPRESSIONS IN THIS IMAGE, AND ONLY ONE CASE SHALL APPLY EVERY TIME: Following are the cases: 1. Simple mathematical expressions like 2 + 2, 3 * 4, 5 / 6, 7 - 8, etc.: In this case, solve and return the answer in the format of a LIST OF ONE DICT [{'expr': given expression, 'result': calculated answer}]. 2. Set of Equations like x^2 + 2x + 1 = 0, 3y + 4x = 0, 5x^2 + 6y + 7 = 12, etc.: In this case, solve for the given variable, and the format should be a COMMA SEPARATED LIST OF DICTS, with dict 1 as {'expr': 'x', 'result': 2, 'assign': true} and dict 2 as {'expr': 'y', 'result': 5, 'assign': true}. This example assumes x was calculated as 2, and y as 5. Include as many dicts as there are variables. 3. Assigning values to variables like x = 4, y = 5, z = 6, etc.: In this case, assign values to variables and return another key in the dict called {'assign': true}, keeping the variable as 'expr' and the value as 'result' in the original dictionary. RETURN AS A LIST OF DICTS. 4. Analyzing Graphical Math problems, which are word problems represented in drawing form, such as cars colliding, trigonometric problems, problems on the Pythagorean theorem, adding runs from a cricket wagon wheel, etc. These will have a drawing representing some scenario and accompanying information with the image. PAY CLOSE ATTENTION TO DIFFERENT COLORS FOR THESE PROBLEMS. You need to return the answer in the format of a LIST OF ONE DICT [{'expr': given expression, 'result': calculated answer}]. 5. Detecting Abstract Concepts that a drawing might show, such as love, hate, jealousy, patriotism, or a historic reference to war, invention, discovery, quote, etc. USE THE SAME FORMAT AS OTHERS TO RETURN THE ANSWER, where 'expr' will be the explanation of the drawing, and 'result' will be the abstract concept. Analyze the equation or expression in this image and return the answer according to the given rules: Make sure to use extra backslashes for escape characters like \\f -> \\\\f, \\n -> \\\\n, etc. Here is a dictionary of user-assigned variables. If the given expression has any of these variables, use its actual value from this dictionary accordingly: {dict_of_vars_str}. DO NOT USE BACKTICKS OR MARKDOWN FORMATTING. never use True always use true"
  // 'In this image a mathematical equation is given, if you find any equation follow these cases, case 1. first of all look for any equation that has empty RHS, if found solve for it. case 2. if there is a simple equation line 1 + 2 ='

  var result = [];
  
  try {
    result = await model.generateContent([prompt, image])
  } catch (error) {
    console.log(error);
  }    
  return res.status(200).json(result?.response?.text());
})

app.listen(8000, () => {
  console.log('Server is running on port 8000');
})