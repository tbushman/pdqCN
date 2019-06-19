 // module =require('module');
const helmet = require('helmet');
const jQuery = require('jquery');
const express = require('express');
// const expressValidation = require('express-validation');
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
// app.use(helmet());
// app.use(helmet.noCache());
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
	// years.forEach(async (a) => {
	// 	if (urls) return;
	// 	await months.forEach(async (b) => {
			if (req.urli) return;
			const imgurl = `https://cdn.pdq.com/wp-content/uploads/${a}/company_${name}.png`;
			// const imgurlf = `https://cdn.pdq.com/wp-content/uploads/${a}/legos_${name}.png`;
			const img = await request(imgurl)
			.then((d) => d)
			.catch((e) => {
				if (e.statusCode && e.statusCode === 404) return null;
				return null;// console.log(e)
			})
			if (img) {
				console.log('imgurl')
				console.log(imgurl)
				req.urli = imgurl
				return next();
				// urls = {
				// 	company: imgurl
				// };
			}
			await alpha.forEach(async (c) => {
				if (req.urli) return;
				const imgiurl = `https://cdn.pdq.com/wp-content/uploads/${a}/company_${name}${c}.png`;
				// const imgiurlf = `https://cdn.pdq.com/wp-content/uploads/${a}/legos_${name}${c}.png`;
				const imgi = await request(imgiurl)
				.then((d) => d)
				.catch((e) => {
					if (e.statusCode && e.statusCode === 404) return null;
					return null;// console.log(e)
				})
				if (imgi) {
					console.log('imgiurl')
					console.log(imgiurl);
					req.urli = imgiurl;
					return next()
					// urls = {
					// 	company: imgiurl
					// };
				}
				
				// urls.push(`https://cdn.pdq.com/wp-content/uploads/${a}/${b}/company_${name}${c}.png`

			})
		// })
		
	});
	// if (urls) {
	// 	req.urls = urls;
	// 	return next();
	// }
	// .forEa
	// request(``, (err, response, body) => {
	// 	console.log(body)
	// 	if (body) {
	// 		urls.company = body
	// 	}
	// })
}

app.get('/', (req, res, next) => {
	return res.render('main', {
		thought: app.locals.thought,
		thinking: app.locals.thinking
	})
})

app.post('/', async (req, res, next) => {
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
		
		// , async (err, response, body) => {
		// 	if (err) return next(err);
		// 	console.log('body:', JSON.parse(body));
		// 
		// })
	} else {
		return res.status(200).send({
			thought: null,
			thinking: true
		})
	}
})

app.post('/employee/:name', getImageUrls, async (req, res, next) => {
	// console.log(req.urli)
	if (req.urli) {
		const url = req.urli;//await getImageUrls(req.params.name);
		return res.status(200).send(url)
	}
})

app.use((err, req, res, next) => {
	console.log('err.stack')
  console.log(Object.keys(err))
	console.log(err)
	console.log(err.stack.toString())
	const isStatusCodeError = /(StatusCodeError.{1,10}500)/.test(err.stack.toString())
	if (
		isStatusCodeError// err.statusCode && err.statusCode === 500
	) {
		return res.render('error', {error: err})
	} else {
		next(err)
	}
	// if (err.stack instanceof expressValidation.StatusCodeError) {
	// 	return res.render('error', {error: err})
	// }
})
app.use((err, req, res, next) => {
  if (req.xhr) {
    res.status(500).send({ error: 'Something failed!' })
  } else {
    next(err)
  }
})
app.use((err, req, res, next) => {
  res.status(500)
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
const server = http.createServer(app);
server.listen('4000')//, onListening);
server.on('error', (error) => {throw error});
server.on('listening', onListening);
function onListening() {
  const addr = server.address();
  console.log('Listening on port '+ addr.port);
}
module.exports = app;
// export default app;