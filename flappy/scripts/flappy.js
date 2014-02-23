function Game() {
	this.settings = {
		"gap":250,
		"spawnRate":78,
		"lastSpawn":0,
		"impulse":120,
		"delay":266,
		"flap":380,
		"click":10
	};
	this.resources = {
		"color":{},
		"image":{},
		"font":{},
		"sprite":{},
		"sound":{}
	};
	function MB() {
		var MQ = {
			"down":[],
			"up":[],
			"click":[]
		};
		return {
			"last":-1,
			"start":{"x":0,"y":0},
			"drag":[],
			"set":function(t,a){MQ[t] = a||[];},
			"activate":function(g,t){
				if (t in MQ) {
					var i = -1; while (++i<MQ[t].length) {
						if (typeof MQ[t][i]==='function') MQ[t][i](g);
					}
				}
			}
		};
	}
	this.mouse = {"x":0,"y":0,"down":[
		MB(),
		MB(),
		MB()
	]};
	this.entities = {};
	this.time = GetTime();
	this.fps = GetFrameRate()||60;
	this.isPlaying = false;
}

/** Sphere wrappers **/
(function(G){
	function hex(n,p) {var r = n.toString(16); while (r.length<p) r = '0'+''+r; return r;}
	G.prototype.loadSound = function(f) {if (!(f in this.resources.sound)) this.resources.sound[f] = LoadSound(f, false);};
	G.prototype.loadFont = function(f) {if (!(f in this.resources.font)) this.resources.font[f] = LoadFont(f);};
	G.prototype.loadImage = function(f) {if (!(f in this.resources.image)) this.resources.image[f] = LoadImage(f);};
	G.prototype.loadSpriteset = function(f) {if (!(f in this.resources.sprite)) this.resources.sprite[f] = LoadSpriteset(f);};
	G.prototype.animate = function(s,d) {
		var i, fp = this.fps>0?(1000/this.fps):16;
		if (!("meta" in s)) {
			s.meta = {
				"time":{"last":GetTime(),"now":GetTime()},
				"direction":{"last":"","now":"","index":-1},
				"frame":{"now":-1,"index":-1},
				"image":{"index":-1}
			};
		}
		//s.meta.time.last = s.meta.time.now;
		//s.meta.direction.last = s.meta.direction.now;
		s.meta.time.now = GetTime();
		s.meta.direction.now = d;
		if (s.meta.direction.index===-1||s.meta.direction.last!==s.meta.direction.now) {
			i = -1; while (++i<s.directions.length) {
				if (s.directions[i].name===d) {
					s.meta.direction.index = i;
					s.meta.direction.last = s.meta.direction.now;
					s.meta.frame.now = 0;
					s.meta.time.last = s.meta.time.now;
					break;
				}
			}
		}
		if (s.meta.direction.index>-1) {
			if ((s.meta.time.now-s.meta.time.last)>=(s.directions[s.meta.direction.index].frames[s.meta.frame.now].delay*fp)) {
				s.meta.frame.now = (s.meta.frame.now+1)%s.directions[s.meta.direction.index].frames.length;
				s.meta.time.last = s.meta.time.now;
			}
			s.meta.image.index = s.directions[s.meta.direction.index].frames[s.meta.frame.now].index;
		}
	};
	G.prototype.createSpritesetFromImage = function(f,fw,fh) {
		this.loadImage(f);
		if (!(f in this.resources.sprite)) {
			var m = this.resources.image[f];
			var nw = Math.round(m.width/fw), nh = Math.round(m.height/fh), n = (nw*nh);
			this.resources.sprite[f] = CreateSpriteset(fw, fh, n, nh, nw);
			//TODO: split the image
			//this.resources.sprite[f].images[0]
		}
	};
	G.prototype.createColor = function(r,g,b) {
		var a = arguments.length>3?arguments[3]|0:255; if (a>255) a = 255; else if (a<0) a = 0;
		var z = hex((r|0)&0xff,2).toUpperCase()+
			hex((g|0)&0xff,2).toUpperCase()+
			hex((b|0)&0xff,2).toUpperCase()+
			hex((a|0)&0xff,2).toUpperCase();
		if (!(z in this.resources.color)) this.resources.color[z] = CreateColor(r,g,b,a);
		return this.resources.color[z];
	};
	G.prototype.isKeyPressed = function(k){return IsKeyPressed(k);};
	G.prototype.isMouseButtonPressed = function(b){return IsMouseButtonPressed(b);};
	G.prototype.width = function(){return GetScreenWidth();};
	G.prototype.height = function(){return GetScreenHeight();};
})(Game);

/** general **/
function Button(x,y, w,h) {
	this.x = x|0;
	this.y = y|0;
	this.width = w|0;
	this.height = h|0;
}
(function(B){
	B.prototype.isActive = function(x,y) {
		return x>=this.x&&x<this.x+this.width&&
			y>=this.y&&y<this.y+this.height;
	};
	B.prototype.over = function(f) {if (typeof f==='function') f(this);};
	B.prototype.out = function(f) {if (typeof f==='function') f(this);};
	B.prototype.down = function(f,x,y) {if (typeof f==='function') f(this, x,y);};
	B.prototype.up = function(f,x,y) {if (typeof f==='function') f(this, x,y);};
	B.prototype.click = function(f,x,y) {if (typeof f==='function') f(this, x,y);};
})(Button);

(function(G){
	G.prototype.ease = {
		"sineInOut":function(t){return -0.5*(Math.cos(Math.PI*t) - 1);}
	};
})(Game);

(function(G){
	var _bg = ["bg0.png", "bg1.png", "bg2.png", "bg4.png", "bg5.png"],
		_fg = [],
		_logo = ["logo.png"],
		_mouse = ["mouse.png"],
		_fonts = ["trigger.rfn"],
		_spr = ["bird.rss"],
		_img = ["pipe.png"],
		_sprimg = {
			"bird.png":{"width":92,"height":64,"names":["fly"]}
			//"pipe.png":{"width":138,"height":793,"names":["bottom"]}
		},
		_bp = {
			"bg0.png":{"x":0,"y":0,"s":0},
			"bg1.png":{"x":0,"y":0,"s":-1},
			"bg2.png":{"x":0,"y":0,"s":-1},
			"bg4.png":{"x":0,"y":0,"s":-2},
			"bg5.png":{"x":0,"y":0,"s":-2}
		};
	G.prototype.init = function() {
		var i=_bg.length; while (--i>-1) this.loadImage(_bg[i]);
		i=_fg.length; while (--i>-1) this.loadImage(_fg[i]);
		i=_logo.length; while (--i>-1) this.loadImage(_logo[i]);
		i=_mouse.length; while (--i>-1) this.loadImage(_mouse[i]);
		i=_fonts.length; while (--i>-1) this.loadFont(_fonts[i]);
		i=_spr.length; while (--i>-1) this.loadSpriteset(_spr[i]);
		i=_img.length; while (--i>-1) this.loadImage(_img[i]);
		for (i in _sprimg) this.createSpritesetFromImage(i, _sprimg[i].width, _sprimg[i].height);
		this.settings.width = this.width();
		this.settings.height = this.height();
		_bp["bg5.png"].y = this.settings.height;
		this.isPlaying = false;
	};
	var tick = function(g,dt){};
	G.prototype.update = function() {
		var t = this.time, fp = this.fps>0?(1000/this.fps):16;
		this.time = GetTime();
		var i, m, s, f;
		i = 0; while (i<_bg.length) {
			f = _bg[i];
			if (_bp[f].s!==0) {
				m = this.resources.image[f];
				s = (this.time-t)*_bp[f].s/fp;
				_bp[f].x = (_bp[f].x+s)%m.width;
			}
			++i;
		}
		if (this.isPlaying) tick(this, this.time-t);
		this.mouse.x = GetMouseX(); this.mouse.y = GetMouseY();
		if (this.isMouseButtonPressed(MOUSE_LEFT)) {
			if (this.mouse.down[0].last<0) {
				this.mouse.down[0].last = this.time;
				this.mouse.down[0].start.x = this.mouse.x;
				this.mouse.down[0].start.y = this.mouse.y;
				this.mouse.down[0].activate(this, 'down');
			}
			else {
				var q = true;
				if (this.mouse.down[0].drag.length>0) {
					var z = this.mouse.down[0].drag[this.mouse.down[0].drag.length-1];
					if (z.time>=this.time||(z.x===this.mouse.x&&z.y===this.mouse.y)) q = false;
				}
				if (q) this.mouse.down[0].drag[this.mouse.down[0].drag.length] = {"time":this.time,"x":this.mouse.x,"y":this.mouse.y};
				this.mouse.down[0].activate(this, 'drag');
			}
		}
		else if (this.mouse.down[0].last>-1&&(this.time-this.settings.click)>this.mouse.down[0].last) {
			this.mouse.down[0].last = -1;
			this.mouse.down[0].drag = [];
			this.mouse.down[0].activate(this, 'up');
			this.mouse.down[0].activate(this, 'click');
		}
	};
	G.prototype.render = function() {};
	G.prototype.renderMouse = function() {
		//var c = this.createColor(0,0,0), i = -1; while (++i<this.mouse.down[0].drag.length) Point(this.mouse.down[0].drag[i].x, this.mouse.down[0].drag[i].y, c);
		this.resources.image["mouse.png"].blit(this.mouse.x,this.mouse.y);
	};
	G.prototype.renderFG = function() {
		var cb = this.createColor(0,0,0);
		if (this.isPlaying) {
			var p;
			if ('pipes' in this.entities) var i = -1; while (++i<this.entities["pipes"].length) {
				p = this.entities["pipes"][i];
				if (("sprite" in p)&&p.sprite.meta.image.index>-1)
					p.sprite.images[p.sprite.meta.image.index].blit(p.x, p.y);
				else if ("image" in p) p.image.rotateBlit(p.x, p.y-(p.a>0?p.image.height:0), p.a);
				else Point(p.x, p.y, cb);
			}
		}
	};
	G.prototype.renderBG = function() {
		var i, x, y, m;
		i = 0; while (i<_bg.length) {
			x = _bp[_bg[i]].x, y = _bp[_bg[i]].y;
			m = this.resources.image[_bg[i]];
			if (y<this.settings.height) {
				m.blit(x%m.width,y);
				if (x>0) {while (x>0) {x -= m.width; m.blit(x%m.width,y);}}
				else if (x+m.width<=this.settings.width) {while (x+m.width<=this.settings.width) {x += m.width; m.blit(x,y);}}
			}
			++i;
		}
		if (this.isPlaying) {}
	};
	G.prototype.mainMenu = function() {
		this.isPlaying = false;
		var l = this.resources.image["logo.png"];
		var f = this.resources.font["trigger.rfn"], fh = f.getHeight();
		var c1 = this.createColor(16,16,144), c2 = this.createColor(192,128,16), c3 = this.createColor(255,255,255,255);
		var cb = this.createColor(0,0,0);
		var done = false;
		var w1 = f.getStringWidth("Play"), b1 = new Button((this.settings.width-w1)/2,this.settings.height/2,w1,fh),
			w2 = f.getStringWidth("Quit"), b2 = new Button((this.settings.width-w2)/2,this.settings.height/2+fh+fh,w2,fh);
		var mx = this.mouse.x, my = this.mouse.y;
		f.setColorMask(c1);
		var ret = 0, click = false;
		this.mouse.down[0].set('down',[
			function(g){
				if (!click) {
					click = true;
					if (b1.isActive(mx,my)) ret = 1;
					else if (b2.isActive(mx,my)) ret = 2;
				}
			}
		]);
		this.mouse.down[0].set('up',[
			function(g){
				if (click) click = false;
			}
		]);
		while (!done) {
			this.renderBG();
			l.blit((this.settings.width-l.width)/2, l.height*2);
			if (b1.isActive(mx,my)) f.setColorMask(c2);
			else f.setColorMask(c1);
			f.drawText(b1.x,b1.y, "Play");
			if (b2.isActive(mx,my)) f.setColorMask(c2);
			else f.setColorMask(c1);
			f.drawText(b2.x,b2.y, "Quit");
			var i = -1; while (++i<this.mouse.down[0].drag.length)
				Point(this.mouse.down[0].drag[i].x, this.mouse.down[0].drag[i].y, cb);
			this.renderMouse();
			FlipScreen();
			this.update();
			mx = this.mouse.x, my = this.mouse.y;
			/*if (this.mouse.down[0].last>-1&&!click) {	// doMouseDown
				click = true;
				if (b1.isActive(mx,my)) ret = 1;
				else if (b2.isActive(mx,my)) ret = 2;
			}
			else if (click) {	// doMouseUp, doMouseClick
				click = false;
			}*/
			if (ret>0) done = true;
		}
		var t = GetTime()+500; while (GetTime()<t) {
			this.renderBG();
			l.blitMask((this.settings.width-l.width)/2, l.height*2, c3);
			FlipScreen();
			this.update();
			c3.alpha = ((t-GetTime())*255/1000)|0;
		}
		this.mouse.down[0].set('down',[]);
		this.mouse.down[0].set('up',[]);
		return ret;
	};
	G.prototype.quit = function() {
		var f = this.resources.font["trigger.rfn"], fh = f.getHeight(), c = this.createColor(0,0,0);
		f.setColorMask(c);
		var t = GetTime()+1000; while (GetTime()<t) {
			this.renderBG();
			f.drawText(fh+fh+fh,fh+fh+fh,"Goodbye!");
			this.renderFG();
			FlipScreen();
			this.update();
		}
	};
	G.prototype.execute = function() {
		var SW = this.width(), SH = this.height(), B = new Button(0,0,SW,SH);
		var initial = {
			"bird":{"x":(SW-92)/2,"y":256},
			"pipe":{"x":SW,"y":this.settings.height-128-this.settings.gap*2}
		};
		this.entities["bird"] = {
			"sprite":this.resources.sprite["bird.rss"].clone(),
			"x":initial.bird.x,
			"y":initial.bird.y,
			"last":initial.bird.y,
			"wiggle":18,
			"delta":-this.settings.flap,
			"time":-1
		};
		function _reset(g) {
			_bp["bg1.png"].y = 0
			_bp["bg2.png"].y = 0
			_bp["bg4.png"].y = 0;
			_bp["bg5.png"].y = g.settings.height;
			g.entities["bird"]["x"] = initial.bird.x,
			g.entities["bird"]["y"] = initial.bird.y,
			g.entities["bird"]["last"] = initial.bird.y,
			g.entities["bird"]["delta"] = -g.settings.flap,
			g.entities["bird"]["time"] = -1;
		}
		var bird = this.entities["bird"];
		this.animate(bird.sprite, "fly");
		var opt = 0;
		while (opt<2) {
			_reset(this);
			opt = this.mainMenu();
			if (opt===1) {
				var click = false;
				var f = this.resources.font["trigger.rfn"], fh = f.getHeight(), c = this.createColor(0,0,0);
				f.setColorMask(c);
				_bp["bg1.png"].y -= 128;
				_bp["bg2.png"].y -= 128;
				_bp["bg4.png"].y -= 128;
				_bp["bg5.png"].y -= 128;
				this.entities["pipes"] = [];
				var RQ = [], UQ = [], i, mx, my;
				var a = 0, ac = Math.PI/180;
				var rq = function(g){
					var t = (g.time-bird.time), w;
					if (bird.delta>-g.settings.flap) {
						if (bird.delta>0) {
							bird.delta -= t;
							w = bird.wiggle*g.ease.sineInOut((g.settings.flap-bird.delta)/g.settings.flap);
							bird.y = bird.last-w;
						}
						else {
							bird.delta -= t;
							w = bird.wiggle*g.ease.sineInOut((-bird.delta)/g.settings.flap);
							bird.y = bird.last-bird.wiggle+w;
						}
					}
					else {
						bird.delta = -g.settings.flap;
						bird.last = bird.y;
					}
					bird.time = g.time;
				};
				this.mouse.down[0].last = -1;
				this.mouse.down[0].set('down',[
					function(g){
						if (!click) {
							click = true;
							if (B.isActive(g.mouse.x,g.mouse.y)) {
								RQ.push(function(g){
									f.drawText(16,16+fh, "TODO:nQ(DOWN,"+g.mouse.x+","+g.mouse.y+")");
									RQ.push(function(g){
										bird.delta = g.settings.flap;
										bird.time = g.time;
										bird.last = bird.y;
										//RQ.push(rq);
									});
								});
							}
						}
					}
				]);
				this.mouse.down[0].set('up',[
					function(g){
						if (click) {
							click = false;
							RQ.push(function(g){f.drawText(16,16+fh, "TODO:nQ(UP,"+g.mouse.x+","+g.mouse.y+")");});
						}
					}
				]);
				tick = function(g,dt) {
					var fp = this.fps>0?(1000/this.fps):16, collide = 0;
					g.animate(bird.sprite, "fly");
					var bi = bird.sprite.images[bird.sprite.meta.image.index];
					if ((bird.y+bi.height)>=_bp["bg5.png"].y) {
						// TODO: GAME OVER (HIT THE FLOOR)
						collide = 1;
					}
					if (bird.delta>-g.settings.flap) RQ.push(rq);
					else {
						bird.y += bird.wiggle*dt/g.settings.flap;	// LINEAR; TODO: MAKE QUADOUT
						bird.last = bird.y;
						RQ.push(function(g){f.drawText(16,16+fh, "FALL("+dt+","+((g.settings.flap*dt/1000)|0)+","+(bird.y|0)+")");});
					}
					if (g.isPlaying) {
						if (g.settings.lastSpawn>0) {
							RQ.push(function(g){f.drawText(16,16+fh+fh, "TODO:SPAWNED("+g.entities["pipes"].length+","+g.settings.lastSpawn+")");});
							g.settings.lastSpawn -= dt;
							var p;
							var i = 0; while (i<g.entities["pipes"].length) {
								p = g.entities["pipes"][i];
								if (p.x<-p.image.width) g.entities["pipes"].splice(i,1);
								else {
									// TODO: CHECK COLLISION
									if ((bird.x+bi.width>=p.x&&bird.x<p.x+p.image.width)) {
										// TODO: GAME OVER (HIT A PIPE)
										if (p.a>0) {
											if (bird.y<=p.y) collide = 2;
										}
										else {
											if (bird.y+bi.height>=p.y) collide = 2;
										}
									}
									g.entities["pipes"][i].x -= dt*2/fp;
									++i;
								}
							}
						}
						else {	// TODO: SPAWN PIPES
							g.settings.lastSpawn = g.settings.spawnRate*fp;
							var py = (initial.pipe.y*Math.random()+g.settings.gap*1.5)|0;
							var p1 = {
								"image":g.resources.image["pipe.png"],
								"x":initial.pipe.x,
								"y":py,
								"a":0,
								"last":py,
								"time":-1
							}, p2 = {
								"image":g.resources.image["pipe.png"],
								"x":initial.pipe.x,
								"y":py-g.settings.gap,
								"a":Math.PI,
								"last":py-g.settings.gap,
								"time":-1
							};
							//g.animate(p.sprite, "bottom");
							g.entities["pipes"].push(p1,p2);
							RQ.push(function(g){f.drawText(16,16+fh+fh, "TODO:SPAWN("+g.settings.lastSpawn+")");});
						}
					}
					if (collide>0) g.isPlaying = false;
				};
				this.isPlaying = true;
				while (this.isPlaying) {
					this.renderBG();
					if (RQ.length>0) {while (RQ.length>0) (RQ.shift())(this);}
					bird.sprite.images[bird.sprite.meta.image.index].rotateBlit(bird.x,bird.y,a);
					this.renderFG();
					if (click) RQ.push(function(g){
						f.drawText(16,g.settings.height-fh-fh, "DOWN:"+g.mouse.down[0].last+" ("+g.mouse.down[0].start.x+","+g.mouse.down[0].start.y+") BIRD("+bird.x+","+bird.y+")");
					});
					else RQ.push(function(g){
						f.drawText(16,g.settings.height-fh-fh, "Press ESC to exit");
					});
					f.drawText(16,16, "BIRD("+bird.delta+":"+bird.time+")");
					this.renderMouse();
					FlipScreen();
					this.update();
					if (UQ.length>0) {while (UQ.length>0) (UQ.shift())(this);}
					//a += ac;
					//mx = this.mouse.x, my = this.mouse.y;
					if (this.isKeyPressed(KEY_ESCAPE)) this.isPlaying = false;
				}
				// TODO: GAME OVER
			}
		}
		this.quit();
		//Abort("TODO: unhandled game end");
	};
})(Game);
