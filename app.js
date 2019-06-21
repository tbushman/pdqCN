const helmet = require('helmet');
const jQuery = require('jquery');
const express = require('express');
const request = require('request-promise-native');
const favicon = require('serve-favicon');
const path = require('path');
const url = require('url');
const http = require('http');
const app = express();
app.set('views', path.join('.', 'views'));
app.set('view engine', 'pug');
app.use(express.static(path.join('.', 'public')));
app.use(favicon(path.join('.', 'public/img', 'favicon.ico')));
app.locals.$ = jQuery;
app.locals.appTitle = 'PDQ Cabalistic_Necromancer';
app.locals.appUrl = 'http://localhost:4000';
app.use(helmet());
app.use(helmet.noCache());

// for iterating through potential last name initial (unknown)
const alpha = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
// for iterating through potential image folders (unknown)
const dates = ['2018/08', '2018/09', '2018/10', '2018/12', '2019/02', '2019/04', '2019/05', '2019/06']

// check if image exists for first name given
function getImageUrls(req, res, next) {
	delete req.urli;
	const name = req.params.name;
	// iterate through folders named by date, looking for an image named by given first name but this time without last name initial
	dates.forEach(async (a) => {
		if (req.urli) return;
		const imgurl = `https://cdn.pdq.com/wp-content/uploads/${a}/company_${name}.png`;
		const img = await request(imgurl)
		.then((d) => d)
		.catch((e) => {
			// ignore not-found errors
			if (e.statusCode && e.statusCode === 404) return null;
			return null;
		})
		if (img) {
			req.urli = imgurl
			return next();
		}
		// iterate through all possible last name initials for given name
		await alpha.forEach(async (c) => {
			// if an image was already found, return
			if (req.urli) return;
			const imgiurl = `https://cdn.pdq.com/wp-content/uploads/${a}/company_${name}${c}.png`;
			const imgi = await request(imgiurl)
			.then((d) => d)
			.catch((e) => {
				if (e.statusCode && e.statusCode === 404) return null;
				return null;
			})
			if (imgi) {
				req.urli = imgiurl;
				return next()
			}
		})
	});
}

app.get('/reset', (req, res, next) => {
	// redirected from 500 error
	delete app.locals.thought;
	app.locals.thinking = false;
	app.locals.info = 'Please try again.'
	return res.redirect(307, '/');
})

app.get('/', (req, res, next) => {
	return res.render('main', {
		info: app.locals.info,
		thought: app.locals.thought,
		thinking: false
	})
})

// request brain api and return result
app.post('/thought', async (req, res, next) => {
	// reset locals info
	delete app.locals.info;
	// only one API call at a time
	if (!app.locals.thinking) {
		delete app.locals.thought;
		app.locals.thinking = true;
		await request('https://pdqweb.azurewebsites.net/api/brain')
		.then(async (response) => {
			if (response) {
				app.locals.thought = JSON.parse(response);
				app.locals.thinking = false;
			}
			return res.status(200).send({
				thought: app.locals.thought,
				thinking: app.locals.thinking
			});
		})
		.catch((err) => next(err));
	} else {
		// no change
		return res.status(200).send({
			thought: app.locals.thought,
			thinking: true
		})
	}
})

app.post('/employee/:name', getImageUrls, async (req, res, next) => {
	if (req.urli) {
		const url = req.urli;
		return res.status(200).send(url)
	}
})

// polled in half-second increments for front-end reactive button state
app.post('/check', (req, res, next) => {
	if (app.locals.thinking) {
		return res.status(200).send(app.locals.thinking);
	} else {
		return res.status(200).send(false);
	}
})

app.post('/notthinking', (req, res, next) => {
	app.locals.thinking = false;
	return res.status(200).send('ok')
})

app.use((err, req, res, next) => {
	const stringErr = JSON.stringify(err)
	const parseErr = JSON.parse(stringErr);
	const is500Err = (parseErr.statusCode === 500);
	if (
		is500Err
	) {
		delete app.locals.thought;
		app.locals.thinking = false;
		app.locals.info = 'Please try again.'
		return res.status(500).end(err)
	} else {
		return next(err)
	}
})

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.render('error', { error: err })
})

app.set('port', '4000');
if (!process.env.TEST_ENV) {
	const server = http.createServer(app);
	server.listen('4000')//, onListening);
	server.on('error', (error) => {throw error});
	server.on('listening', onListening);
	function onListening() {
		console.log('listening on 4000')
	}
}

module.exports = app;