import module from 'module';
import helmet from 'helmet';
import jQuery from 'jquery';
import express from 'express';
import request from 'request-promise-native';
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

const alpha = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
const years = ['2017', '2018', '2019', '2020'];
const months = ['02', '04', '05', '06', '08', '09', '10', '12'];
const dates = ['2018/08', '2018/09', '2018/10', '2018/12', '2019/02', '2019/04', '2019/05', '2019/06']
function whichUrlType() {
	
}

function getImageUrls(req, res, next) {
	let urls = null;
	const name = req.params.name;
	console.log(name);
	dates.forEach(async (a) => {
	// years.forEach(async (a) => {
	// 	if (urls) return;
	// 	await months.forEach(async (b) => {
			if (urls) return;
			const imgurl = `https://cdn.pdq.com/wp-content/uploads/${a}/company_${name}.png`;
			// const imgurlf = `https://cdn.pdq.com/wp-content/uploads/${a}/legos_${name}.png`;
			const img = await request(imgurl)
			.then((d) => d)
			.catch((e) => {
				if (e.statusCode && e.statusCode === 404) return null;
				return null;// console.log(e)
			})
			if (img) {
				console.log(imgurl)
				req.url = imgurl
				return next();
				// urls = {
				// 	company: imgurl
				// };
			}
			await alpha.forEach(async (c) => {
				if (urls) return;
				const imgiurl = `https://cdn.pdq.com/wp-content/uploads/${a}/company_${name}${c}.png`;
				// const imgiurlf = `https://cdn.pdq.com/wp-content/uploads/${a}/legos_${name}${c}.png`;
				const imgi = await request(imgiurl)
				.then((d) => d)
				.catch((e) => {
					if (e.statusCode && e.statusCode === 404) return null;
					return null;// console.log(e)
				})
				if (imgi) {
					console.log(imgiurl);
					req.url = imgiurl;
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
				console.log(response.toString())
				app.locals.thought = response;
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
	console.log(req.url)
	if (req.url) {
		const url = req.url;//await getImageUrls(req.params.name);
		return res.status(200).send(JSON.stringify(url))
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