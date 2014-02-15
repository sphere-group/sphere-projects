function Game() {
	this.settings = {
		"gap":250,
		"spawnRate":78,
		"impulse":120,
		"delay":266,
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
}

/** Sphere-specific **/
(function(G){
	function hex(n,p) {var r = n.toString(16); while (r.length<p) r = '0'+''+r; return r;}
	G.prototype.loadSound = function(f) {if (!(f in this.resources.sound)) this.resources.sound[f] = LoadSound(f, false);};
	G.prototype.loadFont = function(f) {if (!(f in this.resources.font)) this.resources.font[f] = LoadFont(f);};
	G.prototype.loadImage = function(f) {if (!(f in this.resources.image)) this.resources.image[f] = LoadImage(f);};
	G.prototype.loadSpriteset = function(f) {if (!(f in this.resources.sprite)) this.resources.sprite[f] = LoadSpriteset(f);};
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
})(Game);

(function(G){
	var _bg = ["bg0.png", "bg1.png", "bg4.png", "bg5.png"],
		_fg = [],
		_logo = ["logo.png"],
		_mouse = ["mouse.png"],
		_fonts = ["trigger.rfn"],
		_bp = {
			"bg0.png":{"x":0,"y":0,"s":0},
			"bg1.png":{"x":0,"y":0,"s":-1},
			"bg4.png":{"x":0,"y":0,"s":-2},
			"bg5.png":{"x":0,"y":0,"s":-3}
		};
	G.prototype.init = function() {
		var i=_bg.length; while (--i>-1) this.loadImage(_bg[i]);
		i=_fg.length; while (--i>-1) this.loadImage(_fg[i]);
		i=_logo.length; while (--i>-1) this.loadImage(_logo[i]);
		i=_mouse.length; while (--i>-1) this.loadImage(_mouse[i]);
		i=_fonts.length; while (--i>-1) this.loadFont(_fonts[i]);
		this.settings.width = this.width();
		this.settings.height = this.height();
		_bp["bg5.png"].y = this.settings.height;
	};
	G.prototype.update = function() {
		var i, m;
		i = 0; while (i<_bg.length) {
			if (_bp[_bg[i]].s!==0) {
				m = this.resources.image[_bg[i]];
				_bp[_bg[i]].x = (_bp[_bg[i]].x+_bp[_bg[i]].s)%m.width;
			}
			++i;
		}
		this.mouse.x = GetMouseX(); this.mouse.y = GetMouseY();
		if (this.isMouseButtonPressed(MOUSE_LEFT)) {
			if (this.mouse.down[0].last<0) {
				this.mouse.down[0].last = GetTime();
				this.mouse.down[0].start.x = this.mouse.x;
				this.mouse.down[0].start.y = this.mouse.y;
			}
			else {
				var q = true;
				if (this.mouse.down[0].drag.length>0) {
					var z = this.mouse.down[0].drag[this.mouse.down[0].drag.length-1];
					if (z.time===GetTime()||(z.x===this.mouse.x&&z.y===this.mouse.y)) q = false;
				}
				if (q) this.mouse.down[0].drag[this.mouse.down[0].drag.length] = {"time":GetTime(),"x":this.mouse.x,"y":this.mouse.y};
			}
		}
		else if (this.mouse.down[0].last>-1&&(GetTime()-this.settings.click)>this.mouse.down[0].last) {
			this.mouse.down[0].last = -1;
			this.mouse.down[0].drag = [];
		}
	};
	G.prototype.render = function() {};
	G.prototype.renderMouse = function() {
		var c = this.createColor(0,0,0);
		var i = -1; while (++i<this.mouse.down[0].drag.length) Point(this.mouse.down[0].drag[i].x, this.mouse.down[0].drag[i].y, c);
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
		var c1 = this.createColor(16,16,144), c2 = this.createColor(192,128,16);
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
				done = true;
			}
		}
		return ret;
	};
	G.prototype.execute = function() {
		var opt = this.mainMenu();
		if (opt===2) Abort("TODO: GAME::QUIT");
		else if (opt===1) {
			var f = this.resources.font["trigger.rfn"], fh = f.getHeight(), c = this.createColor(0,0,0);
			f.setColorMask(c);
			_bp["bg1.png"].y -= 128;
			_bp["bg4.png"].y -= 128;
			_bp["bg5.png"].y -= 128;
			var click = false;
			this.mouse.down[0].last = -1;
			var RQ = [], UQ = [], i;
			while (!this.isKeyPressed(KEY_ESCAPE)) {
				this.renderBG();
				if (RQ.length>0) {while (RQ.length>0) (RQ.shift())(this);}
				this.renderFG();
				if (this.mouse.down[0].last>-1) {
					f.drawText(16,this.settings.height-fh-fh, "DOWN:"+this.mouse.down[0].last+" ("+this.mouse.down[0].start.x+","+this.mouse.down[0].start.y+")");
				}
				else {
					f.drawText(16,this.settings.height-fh-fh, "Press ESC to exit");
					if (click) {
						click = false;
						RQ.push(function(g){f.drawText(16,g.settings.height-fh-fh-fh, "TODO:nQ(UP,"+g.mouse.x+","+g.mouse.y+")");});
					}
				}
				this.renderMouse();
				FlipScreen();
				this.update();
				if (this.mouse.down[0].last>-1&&!click) {
					click = true;
					RQ.push(function(g){f.drawText(16,g.settings.height-fh-fh-fh, "TODO:nQ(DOWN,"+g.mouse.x+","+g.mouse.y+")");});
				}
			}
		}
	};
})(Game);
