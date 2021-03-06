import twilio from "twilio";
import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/client/client";
import withHandler, { ResponseType } from "@libs/server/withHandler";

const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const { phone, email } = req.body;
  const user = phone ? { phone: +phone } : email ? { email } : null;
  const payload = Math.floor(100000 + Math.random() * 900000) + "";
  const token = await client.token.create({
    data: {
      payload,
      user: {
        connectOrCreate: {
          where: {
            ...user,
          },
          create: {
            name: "Anonymous",
            ...user,
          },
        },
      },
    },
  });
  if(phone) {
    const message = await twilioClient.messages.create({
      messagingServiceSid: process.env.TWILIO_MSID,
      to: `82${process.env.MY_PHONE}`!,
      body: `Your login token is ${payload}.`
    })
    console.log(message);
  }
  return res.json({
    ok: true,
  });
}

export default withHandler("POST", handler);
