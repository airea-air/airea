
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import rateLimit from 'express-rate-limit';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 50 }));

function buildTransporter() {
  if (!process.env.SMTP_HOST) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || 'false') === 'true',
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined
  });
}

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/forms/contact', upload.single('attachment'), async (req, res) => {
  const transporter = buildTransporter();
  if (!transporter) {
    return res.status(501).json({ ok: false, message: 'SMTP non configuré.' });
  }

  const { firstName, lastName, email, phone, subject, message, company_website } = req.body;
  if (company_website) return res.status(400).json({ ok: false });
  if (!firstName || !lastName || !email || !subject || !message) {
    return res.status(400).json({ ok: false, message: 'Champs obligatoires manquants.' });
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: process.env.CONTACT_TO,
    replyTo: email,
    subject: `[Site Airea] ${subject}`,
    text: `Prénom: ${firstName}\nNom: ${lastName}\nEmail: ${email}\nTéléphone: ${phone || ''}\n\n${message}`,
    attachments: req.file ? [{ filename: req.file.originalname, content: req.file.buffer }] : []
  });

  res.json({ ok: true });
});

app.post('/api/forms/recruitment', upload.single('attachment'), async (req, res) => {
  const transporter = buildTransporter();
  if (!transporter) {
    return res.status(501).json({ ok: false, message: 'SMTP non configuré.' });
  }

  const { firstName, lastName, email, phone, subject, message, company_website } = req.body;
  if (company_website) return res.status(400).json({ ok: false });
  if (!firstName || !lastName || !email || !subject || !message) {
    return res.status(400).json({ ok: false, message: 'Champs obligatoires manquants.' });
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: process.env.RECRUITMENT_TO,
    replyTo: email,
    subject: `[Recrutement Airea] ${subject}`,
    text: `Prénom: ${firstName}\nNom: ${lastName}\nEmail: ${email}\nTéléphone: ${phone || ''}\n\n${message}`,
    attachments: req.file ? [{ filename: req.file.originalname, content: req.file.buffer }] : []
  });

  res.json({ ok: true });
});

app.listen(port, () => {
  console.log(`Airea forms server listening on http://localhost:${port}`);
});
