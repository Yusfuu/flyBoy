const { User, Flight, Reservation } = require('./models');
const bcrypt = require('bcrypt');
const expresso = require('./src/server');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const nodemailer = require('nodemailer');
const Mailgen = require('mailgen');
const { examples } = require('./data/index');


const app = expresso();

app.use(app.static('public'));

app.get('/fly', async (req, res) => {
  res.render('fly', { section: examples });
});

app.get('/', async (req, res) => {
  res.render('fly', { section: examples });
});

app.get('/account/signin', (req, res) => res.render('account@signin'));
app.get('/account/signup', (req, res) => res.render('account@signup'));


app.get('/explore', async (req, res) => {
  const flights = await Flight.findAll({ where: { seats: { [Op.gt]: 0 } } });
  res.render('explore', { flights });
});


app.get('/explore/:id', async (req, res) => {
  const { id } = req.params;
  const flight = await Flight.findOne({ where: { id } });
  res.render('flight', { flight });
});


app.post('/ticket', async (req, res,) => {
  const data = req.body;
  if (!req?.cookies?.token) {
    res.writeHead(302, { location: "http://localhost:3000/account/signin" });
    res.render('account@signin');
  }
  const flight = await Flight.findOne({ where: { id: data.flight_id } });
  const user = jwt.verify(req.cookies.token, 'shhhhh');

  if (flight.seats - data.person_count > 0) {
    const balance = flight.price * data.person_count;

    const ticket = {
      balance,
      user,
      places: data.person_count,
      flight,
    }

    Reservation.create({
      UserId: user.id,
      FlightId: flight.id,
    });

    Flight.update({ seats: flight.seats - data.person_count }, { where: { id: data.flight_id } });

    res.writeHead(302, { location: "/ticket" });
    return res.render('ticket', { ticket });
  } else {
    res.json({ error: 'Not enough seats' });
  }

});


app.post('/api/account/auth', async (req, res) => {
  const user = req.body;

  if (user.type === 'register') {
    const emailExists = await User.findOne({ where: { email: user.email } });

    if (!emailExists) {
      user.password = await bcrypt.hash(user.password, 10);
      console.log(user);
      const { id } = await User.create(user);
      delete user.password;
      user.id = id;
      const token = await jwt.sign(user, 'shhhhh');
      res.setCookie('token', token);
      res.json({ success: true });
    } else {
      res.json({ error: 'Email already exists' });
    }
  }

  if (user.type === 'login') {
    const userExists = await User.findOne({ where: { email: user.email } });

    if (userExists) {
      const validPassword = await bcrypt.compare(user.password, userExists.password);

      if (validPassword) {
        const token = await jwt.sign(user, 'shhhhh');
        res.setCookie('token', token);
        res.json({ success: true });
      } else {
        res.json({ error: 'Invalid password' });
      }
    } else {
      res.json({ error: 'Email not found' });
    }
  }
});




app.get('/admin/create', async (req, res) => {
  res.render('admin@create');
});


app.get('/admin/view/:id', async (req, res) => {
  const { id } = req.params;
  const flight = await Flight.findOne({ where: { id } });
  res.render('admin@vue', { flight });
});


app.post('/admin/delete', async (req, res) => {
  const data = req.body;
  await Flight.destroy({ where: { id: data.id } });
  res.writeHead(302, { location: "/admin" });
  res.render('admin@main');
});

app.post('/admin/edite', async (req, res) => {
  const data = req.body;
  await Flight.update({
    seats: data.seats,
    price: data.price,
    departure: data.departure,
    arrival: data.arrival,
    departure_time: data.departure_time,
    arrival_time: data.arrival_time,
  }, { where: { id: data.id } });
  res.writeHead(302, { location: "/admin" });
  res.render('admin@main');
});

app.get('/admin/create', async (req, res) => {
  res.render('admin@create');
});

app.post('/admin/create', async (req, res) => {
  const data = req.body;
  const flight = await Flight.create(data);
  res.writeHead(302, { location: "http://localhost:3000/admin/create" });
  res.render('admin@create');
});


app.get('/admin', async (req, res) => {
  const flights = await Flight.findAll({ where: { seats: { [Op.gt]: 0 } } });
  res.render('admin@main', { flights });
});





app.post('/email', async (req, res) => {
  const data = req.body;
  const decode = decodeURIComponent(data.ticket);
  const json = JSON.parse(decode);

  let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    service: 'Gmail', // true for 465, false for other ports
    auth: {
      user: 'checker.safiairline@gmail.com', // generated ethereal user
      pass: 'SafiAIrline@123', // generated ethereal password
    },
  });

  // Configure mailgen by setting a theme and your product info
  var mailGenerator = new Mailgen({
    theme: 'default',
    product: {
      // Appears in header & footer of e-mails
      name: 'SAFI AIRLINE',
      link: 'https://github.com/Yusfuu/flyBoy'
      // Optional product logo
      // logo: 'https://mailgen.js/img/logo.png'
    }
  });

  var email = {
    body: {
      name: json.user.firstName + ' ' + json.user.lastName,
      intro: 'Welcome to SAFI AIRLINE! We\'re very excited to have you on board.',
      action: {
        instructions: 'Your Ticket is ready!',
        button: {
          color: '#22BC66', // Optional action button color
          text: 'Go To Home',
          link: 'http://localhost:3000/fly'
        }
      },
      table: {
        data: [
          {
            item: 'Full name',
            description: json.user.firstName + ' ' + json.user.lastName,
          },
          {
            item: 'Places',
            description: json.places,
          },
          {
            item: 'Email address',
            description: json.user.email,
          },
          {
            item: 'Price expectation',
            description: json.balance + ' MAD',
          },
          {
            item: 'Departure',
            description: json.flight.departure_airport + ' at ' + new Date(json.flight.departure_datetime).toDateString(),
          },
          {
            item: 'Arrival',
            description: json.flight.arrival_airport + ' at ' + new Date(json.flight.arrival_datetime).toDateString(),
          },
        ],
        columns: {}
      },
      outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
    }
  };


  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: 'SAFI AIRLINE <checker.safiairline@gmail.com>',
    to: json.user.email, // list of receivers
    subject: "Ticket Ready You Can Download it now ",
    text: "the link to download your ticket is here : ",
    html: mailGenerator.generate(email),
  });

  res.writeHead(302, { location: "/fly" });
  return res.render('/fly');
});



app.listen(3000, () => {
  console.log('Server is running on port 3000');
});