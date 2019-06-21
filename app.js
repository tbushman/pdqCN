 // module =require('module');
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
// app.locals.Vue = Vue;
app.locals.appTitle = 'PDQ Cabalistic_Necromancer';
app.locals.appUrl = 'http://localhost:4000';
app.use(helmet());
app.use(helmet.noCache());
// app.use((req, res, next) => {
// 	res.set({
// 		'Access-Control-Allow-Origin' : req.headers.origin,
// 		'Access-Control-Allow-Methods' : 'GET, POST, HEAD, OPTIONS',
// 		'Access-Control-Allow-Headers' : 'Cache-Control, Origin, Content-Type, Accept',
// 		'Access-Control-Allow-Credentials' : true
// 	});
// 	next();
// });

const alpha = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
// const years = ['2017', '2018', '2019', '2020'];
// const months = ['02', '04', '05', '06', '08', '09', '10', '12'];
const dates = ['2018/08', '2018/09', '2018/10', '2018/12', '2019/02', '2019/04', '2019/05', '2019/06']

function getImageUrls(req, res, next) {
	delete req.urli;
	const name = req.params.name;
	console.log(name);
	dates.forEach(async (a) => {
		if (req.urli) return;
		const imgurl = `https://cdn.pdq.com/wp-content/uploads/${a}/company_${name}.png`;
		const img = await request(imgurl)
		.then((d) => d)
		.catch((e) => {
			if (e.statusCode && e.statusCode === 404) return null;
			return null;
		})
		if (img) {
			console.log('imgurl')
			console.log(imgurl)
			req.urli = imgurl
			return next();
		}
		await alpha.forEach(async (c) => {
			if (req.urli) return;
			const imgiurl = `https://cdn.pdq.com/wp-content/uploads/${a}/company_${name}${c}.png`;
			const imgi = await request(imgiurl)
			.then((d) => d)
			.catch((e) => {
				if (e.statusCode && e.statusCode === 404) return null;
				return null;
			})
			if (imgi) {
				console.log('imgiurl')
				console.log(imgiurl);
				req.urli = imgiurl;
				return next()
			}
		})
	});
}

app.use((req, res, next) => {
  app.locals.env = process.env;
})

app.get('/reset', (req, res, next) => {
	console.log('reset');
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

app.post('/thought', async (req, res, next) => {
	delete app.locals.info;
	delete app.locals.thought;
	if (!app.locals.thinking) {
		app.locals.thinking = true;
		await request('https://pdqweb.azurewebsites.net/api/brain')
		.then(async (response) => {
			if (response) {
				console.log('response');
				console.log(response)
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
		return res.status(200).send({
			thought: null,
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
		console.log(err);
		delete app.locals.thought;
		app.locals.thinking = false;
		app.locals.info = 'Please try again.'
		return res.status(500).end(err)
	} else {
		return next(err)
	}
})
// app.use((err, req, res, next) => {
//   if (req.xhr) {
//     res.status(500).send({ error: 'Something failed!' })
//   } else {
//     next(err)
//   }
// })
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.render('error', { error: err })
})

// app.use((req, res, next) => {
// 	console.log(res)
// 	if (res.status && res.status === 500) {
// 		console.log('forward 500')
// 		return next(res)
// 	}
// 	const err = new Error('Not Found');
// 	var outputPath = url.parse(req.url).pathname;
// 	console.log(outputPath);
// 	err.status = 404;
// 	return next(err);
// });
// 
// app.use((err, req, res) => {
// 	res.status(err.status || 500);
// 	res.render('error', {
// 		message: err.message,
// 		error: {}
// 	});
// });

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
// export default app;