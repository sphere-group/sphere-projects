function Game() {
	this.settings = {
		"gap":250,
		"spawnRate":78,
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
	this.mouse = {"x":0,"y":0,"down":[
		{"last":-1,"start":{"x":0,"y":0},"drag":[]},
		{"last":-1,"start":{"x":0,"y":0},"drag":[]}
	]};
	this.time = GetTime();
	this.fps = GetFrameRate()||60;
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
		if ((s.meta.time.now-s.meta.time.last)>=(s.directions[s.meta.direction.index].frames[s.meta.frame.now].delay*fp)) {
			s.meta.frame.now = (s.meta.frame.now+1)%s.directions[s.meta.direction.index].frames.length;
			s.meta.time.last = s.meta.time.now;
		}
		s.meta.image.index = s.directions[s.meta.direction.index].frames[s.meta.frame.now].index;
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
	var _bg = ["bg0.png", "bg1.png", "bg4.png", "bg5.png"],
		_fg = [],
		_logo = ["logo.png"],
		_mouse = ["mouse.png"],
		_fonts = ["trigger.rfn"],
		_spr = ["bird.rss"],
		_sprimg = {
			"bird.png":{"width":92,"height":64,"names":["fly"]}
		},
		_bp = {
			"bg0.png":{"x":0,"y":0,"s":0},
			"bg1.png":{"x":0,"y":0,"s":-1},
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
		for (i in _sprimg) this.createSpritesetFromImage(i, _sprimg[i].width, _sprimg[i].height);
		this.settings.width = this.width();
		this.settings.height = this.height();
		_bp["bg5.png"].y = this.settings.height;
	};
	G.prototype.update = function() {
		var t = this.time;
		this.time = GetTime();
		var i, m, s, f;
		i = 0; while (i<_bg.length) {
			f = _bg[i];
			if (_bp[f].s!==0) {
				m = this.resources.image[f];
				s = (this.time-t)*_bp[f].s/16;
				_bp[f].x = (_bp[f].x+s)%m.width;
			}
			++i;
		}
		this.mouse.x = GetMouseX(); this.mouse.y = GetMouseY();
		if (this.isMouseButtonPressed(MOUSE_LEFT)) {
			if (this.mouse.down[0].last<0) {
				this.mouse.down[0].last = this.time;
				this.mouse.down[0].start.x = this.mouse.x;
				this.mouse.down[0].start.y = this.mouse.y;
			}
			else {
				var q = true;
				if (this.mouse.down[0].drag.length>0) {
					var z = this.mouse.down[0].drag[this.mouse.down[0].drag.length-1];
					if (z.time>=this.time||(z.x===this.mouse.x&&z.y===this.mouse.y)) q = false;
				}
				if (q) this.mouse.down[0].drag[this.mouse.down[0].drag.length] = {"time":this.time,"x":this.mouse.x,"y":this.mouse.y};
			}
		}
		else if (this.mouse.down[0].last>-1&&(this.time-this.settings.click)>this.mouse.down[0].last) {
			this.mouse.down[0].last = -1;
			this.mouse.down[0].drag = [];
		}
	};
	G.prototype.render = function() {};
	G.prototype.renderMouse = function() {
		//var c = this.createColor(0,0,0), i = -1; while (++i<this.mouse.down[0].drag.length) Point(this.mouse.down[0].drag[i].x, this.mouse.down[0].drag[i].y, c);
		this.resources.image["mouse.png"].blit(this.mouse.x,this.mouse.y);
	};
	G.prototype.renderFG = function() {};
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
	};
	G.prototype.mainMenu = function() {
		var l = this.resources.image["logo.png"];
		var f = this.resources.font["trigger.rfn"], fh = f.getHeight();
		var c1 = this.createColor(16,16,144), c2 = this.createColor(192,128,16), c3 = this.createColor(255,255,255,255);
		var done = false;
		var w1 = f.getStringWidth("Play"), b1 = new Button((this.settings.width-w1)/2,this.settings.height/2,w1,fh),
			w2 = f.getStringWidth("Quit"), b2 = new Button((this.settings.width-w2)/2,this.settings.height/2+fh+fh,w2,fh);
		var mx = this.mouse.x, my = this.mouse.y;
		f.setColorMask(c1);
		var ret = 0;
		while (!done) {
			this.renderBG();
			l.blit((this.settings.width-l.width)/2, l.height*2);
			if (b1.isActive(mx,my)) f.setColorMask(c2);
			else f.setColorMask(c1);
			f.drawText(b1.x,b1.y, "Play");
			if (b2.isActive(mx,my)) f.setColorMask(c2);
			else f.setColorMask(c1);
			f.drawText(b2.x,b2.y, "Quit");
			this.renderMouse();
			FlipScreen();
			this.update();
			mx = this.mouse.x, my = this.mouse.y;
			if (this.mouse.down[0].last>-1) {
				if (b1.isActive(mx,my)) ret = 1;
				else if (b2.isActive(mx,my)) ret = 2;
			}
			if (ret>0) done = true;
		}
		var t = GetTime()+500; while (GetTime()<t) {
			this.renderBG();
			l.blitMask((this.settings.width-l.width)/2, l.height*2, c3);
			FlipScreen();
			this.update();
			c3.alpha = ((t-GetTime())*255/1000)|0;
		}
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
		var bird = {
			"sprite":this.resources.sprite["bird.rss"].clone(),
			"x":(this.width()-92)/2,
			"y":256,
			"last":256,
			"wiggle":18,
			"delta":0,
			"time":-1
		};
		this.animate(bird.sprite, "fly");
		var opt = this.mainMenu();
		if (opt===2) this.quit();
		else if (opt===1) {
			var f = this.resources.font["trigger.rfn"], fh = f.getHeight(), c = this.createColor(0,0,0);
			f.setColorMask(c);
			_bp["bg1.png"].y -= 128;
			_bp["bg4.png"].y -= 128;
			_bp["bg5.png"].y -= 128;
			var click = false;
			this.mouse.down[0].last = -1;
			var RQ = [], UQ = [], i;
			var a = 0, ac = Math.PI/180;
			var rq = function(g){
				var t = (g.time-bird.time), w;
				if (bird.delta>0) {
					bird.delta -= t;
					w = bird.wiggle*g.ease.sineInOut((g.settings.flap-bird.delta)/g.settings.flap);
					bird.y = bird.last-w;
				}
				else if (bird.delta>-g.settings.flap) {
					bird.delta -= t;
					w = bird.wiggle*g.ease.sineInOut((-bird.delta)/g.settings.flap);
					bird.y = bird.last-bird.wiggle+w;
				}
				else {
					bird.delta = 0;
					bird.last = bird.y;
				}
				bird.time = g.time;
			};
			while (!this.isKeyPressed(KEY_ESCAPE)) {
				this.renderBG();
				if (RQ.length>0) {while (RQ.length>0) (RQ.shift())(this);}
				bird.sprite.images[bird.sprite.meta.image.index].rotateBlit(bird.x,bird.y,a);
				this.renderFG();
				if (this.mouse.down[0].last>-1) {
					f.drawText(16,this.settings.height-fh-fh, "DOWN:"+this.mouse.down[0].last+" ("+this.mouse.down[0].start.x+","+this.mouse.down[0].start.y+") BIRD("+bird.x+","+bird.y+")");
				}
				else {
					f.drawText(16,this.settings.height-fh-fh, "Press ESC to exit");
					if (click) {
						click = false;
						RQ.push(function(g){f.drawText(16,g.settings.height-fh-fh-fh, "TODO:nQ(UP,"+g.mouse.x+","+g.mouse.y+")");});
					}
				}
				f.drawText(16,this.settings.height-fh-fh-fh-fh, "BIRD("+bird.delta+":"+bird.time+")");
				this.renderMouse();
				FlipScreen();
				this.update();
				a += ac;
				this.animate(bird.sprite, "fly");
				if (bird.delta!==0) RQ.push(rq);
				if (this.mouse.down[0].last>-1&&!click) {
					click = true;
					RQ.push(function(g){
						f.drawText(16,g.settings.height-fh-fh-fh, "TODO:nQ(DOWN,"+g.mouse.x+","+g.mouse.y+")");
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
	};
})(Game);
