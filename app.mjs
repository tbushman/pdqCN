import module from 'module';
import helmet from 'helmet';
import jQuery from 'jquery';
import express from 'express';
import request from 'request';
import favicon from 'serve-favicon';
import Vue from 'vue';
import path from 'path';
import url from 'url';
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

function whichUrlType() {
	
}

async function getImageUrls(name) {
	let urls = {}
	request(`https://cdn.pdq.com/wp-content/uploads/2018/8/company_${name}.png`, (err, response, body) => {
		console.log(body)
		if (body) {
			urls.company = body
		}
	})
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
		request('https://pdqweb.azurewebsites.net/api/brain', async (err, response, body) => {
			if (err) return next(err);
			console.log('body:', body);
			if (body) {
				app.locals.thought = body;
				app.locals.thinking = false;
			}
			const urls = await getImageUrls(body.name);
			return res.status(200).send({
				thought: app.locals.thought,
				thinking: app.locals.thinking,
				urls: urls
			});
		})
	} else {
		return res.status(200).send({
			thought: null,
			thinking: true
		})
	}
})

app.use((req, res, next) => {
	const err = new Error('Not Found');
	var outputPath = url.parse(req.url).pathname;
	console.log(outputPath);
	err.status = 404;
	return next(err);
});

app.use((err, req, res) => {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: {}
	});
});

export default app;