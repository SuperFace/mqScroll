/*!
 * mqScroll 1.0.0
 * Author: SuperFace
 * Date: 2019-11-17
 */
var mqScroll = (function(){
	var defaults = {
  	    direction: 'left',   // 滚动方向
  	    easing: 'swing',      // 缓动方式
  	    step: 1,              // 滚动步长
  	    accel: 200,           // 手动滚动速度
  	    speed: 800,           // 自动滚动速度
  	    time: 4000,           // 自动滚动间隔时间
  	    boxSum: 3,           //一屏显示个数
  	    auto: true,           // 是否自动滚动
  	    hoverLock: true,      // 鼠标移入移出锁定
  	    prevBtn: true,        // 是否使用 prev 按钮
  	    nextBtn: true         // 是否使用 next 按钮
  	};
    var Scroller = function(obj, settings) {
    	this.dom = {};
    	this.api = {};
    	this.lockState = false;
    	this.order = null;
    	this.obj;
    	this.settings;
    	if (!obj.length) {return};
    	this.init(obj, settings);
    };

    // 检测是否为 DOM 元素
    var isElement = function(o){
      if(o && (typeof HTMLElement === 'function' || typeof HTMLElement === 'object') && o instanceof HTMLElement) {
        return true;
      } else {
        return (o && o.nodeType && o.nodeType === 1) ? true : false;
      };
    };

    // 检测是否为 jQuery 对象
    var isJquery = function(o){
      return (o && o.length && (typeof jQuery === 'function' || typeof jQuery === 'object') && o instanceof jQuery) ? true : false;
    };

    Scroller.prototype.init = function(obj, settings, callback){
      var self = this;

      self.dom.el = obj;
      self.settings = $.extend({}, defaults, settings);//和默认属性合并
      self.build();

      self.api = {
        play: function(){
          self.settings.auto = true;
          self.play();
        },
        stop: function(){
          self.settings.auto = false;
          self.stop();
        },
        prev: function(speed){
          speed = parseInt(speed, 10);
          if (typeof speed !== 'number' || speed < 0) {
            speed = self.settings.speed;
          };
          self.goto(self.prevVal, speed);
        },
        next: function(speed){
          speed = parseInt(speed, 10);
          if (typeof speed !== 'number' || speed < 0) {
            speed = self.settings.speed;
          };
          self.goto(self.nextVal, speed);
        },
        goto: function(order){
        	order = parseInt(order, 10);
        	if (typeof order == 'number' && order >= 0) {
        		if (!self.lockState) {
        			self.goto(null, null, order);
        		}else{
        			self.order = order;
        		}
            };
        }
      };
    };

    Scroller.prototype.build = function(){
      var self = this;

      self.dom.box = self.dom.el.find('.box');
      self.dom.list = self.dom.box.find('.list');
      self.dom.items = self.dom.list.find('li');
      self.itemWidth = self.dom.items.outerWidth();
      self.itemHeight = self.dom.items.outerHeight();
      
      self.itemSum = self.dom.items.length;

      // 没有元素或只有1个元素时，不进行滚动
      //if (self.itemSum <= 1){return};

      self.dom.prevBtn = self.dom.el.find('.prev');
      self.dom.nextBtn = self.dom.el.find('.next');

      if (self.settings.direction === 'left' || self.settings.direction === 'right') {
    	
        // 容器宽度不足时，不进行滚动
        //if (self.itemWidth * self.itemSum <= self.dom.box.outerWidth()) {return};

        self.prevVal = 'right';
        self.nextVal = 'left';
        self.moveType = "width";
        self.moveVal = self.itemWidth;

      } else {
    	
        // 容器高度不足时，不进行滚动
        //if (self.itemHeight * self.itemSum <= self.dom.box.outerHeight()){return};

        self.prevVal = 'bottom';
        self.nextVal = 'top';
        self.moveType = "height";
        self.moveVal = self.itemHeight;
      };
      // 内容个数==box容纳个数，不滚动
      if(self.itemSum == self.settings.boxSum) return;
      
      // 内容个数不足时，不进行滚动
      // 并进行合理填充 
      if(self.itemSum < self.settings.boxSum){
    	  if(Math.floor(self.settings.boxSum/self.itemSum) <= 1){//一倍多
    		  var html = '';
    		  for(var i=0; i<self.settings.boxSum-self.itemSum; i++){
    			  html += $(self.dom.items[i]).prop("outerHTML");
    		  }
    		  self.dom.list.append(html);  
    	  }else{//n倍多
    		  var html = '';
    		  for(var j =0; j<Math.floor(self.settings.boxSum/self.itemSum); j++){
    			  html += self.dom.list.html();
    		  }
    		  if(self.settings.boxSum % self.itemSum > 0){
    			  for(var jj =0; jj<self.boxSum % self.itemSum; jj++){
        			  html += $(self.dom.items[jj]).prop("outerHTML");
        		  }
    		  }
    		  self.dom.list.append(html);
    	  }
    	  return;
      }

      // 元素：后补
      self.dom.list.append(self.dom.list.html());

      // 添加元素：手动操作按钮
      if (self.settings.prevBtn && !self.dom.prevBtn.length) {
        self.dom.prevBtn = $('<a></a>', {'class':'prev'}).prependTo(self.dom.el);
      };
      if (self.settings.nextBtn && !self.dom.nextBtn.length) {
        self.dom.nextBtn = $('<a></a>', {'class':'next'}).prependTo(self.dom.el);
      };

      // 事件：手动操作
      if (self.settings.nextBtn && self.dom.nextBtn.length) {
        self.dom.nextBtn.bind('click', function(){
        	console.log(self.lockState);
          if (!self.lockState) {
            self.goto(self.nextVal, self.settings.accel);
          };
        });
      };
      if (self.settings.prevBtn && self.dom.prevBtn.length) {
        self.dom.prevBtn.bind('click', function(){
        	console.log(self.lockState);
          if (!self.lockState) {
            self.goto(self.prevVal, self.settings.accel);
          };
        });
      };

      // 事件：鼠标移入停止，移出开始
      if (self.settings.hoverLock) {
        self.dom.box.on('mouseenter', function(){
          self.stop();
        });
        self.dom.box.on('mouseleave', function(){
          self.play();
        });
      };

      self.play();
    };

    // 方法：开始
    Scroller.prototype.play = function(){
      var self = this;

      if (!self.settings.auto) {return};
      self.stop();

      self.run = setTimeout(function(){
        self.goto();
      }, self.settings.time);
    };

    // 方法：停止
    Scroller.prototype.stop = function(){
      // 立即停止（效果不是很好）
      // this.dom.box.stop(true);
      if (typeof(this.run) !== 'undefined') {
        clearTimeout(this.run);
      };
    };

    // 方法：滚动
    Scroller.prototype.goto = function(d, t, n){
      var self = this;
      var _max;  // 滚动的最大限度
      var _dis;  // 滚动的距离
      var _speed = t || self.settings.speed;

      if (typeof d !== 'string') {
        d = self.settings.direction;
      };
      //手动定位到指定位置上
      var isOrder = false;
      var orderTo = parseInt(n, 10);
	  if (typeof orderTo == 'number' && orderTo >= 0) {
		  isOrder = true;
	  };


      self.stop();
      self.lockState = true;

      switch(d) {
        case 'left':
        case 'top':
          _max = self.itemSum * self.moveVal;

          if (d === 'left') {
        	  if(isOrder){
          		self.order = orderTo;
	          }else{
          		_dis = self.dom.box.scrollLeft() + (self.moveVal * self.settings.step);

                  if (_dis % self.itemWidth > 0) {
                    _dis -= (_dis % self.itemWidth);
                  };

                  if (_dis > _max){
                    _dis = _max;
                  };

                  self.dom.box.animate({
                    'scrollLeft': _dis
                  }, _speed, self.settings.easing, function(){
                    if (parseInt(self.dom.box.scrollLeft(), 10) >= _max) {
                      self.dom.box.scrollLeft(0);
                    };
                  });
	         }
	         self.dom.box.queue(function(){
                  self.lockState = false;
                  if(self.order){
                	  var orderDis = self.moveVal * (self.order - 1);
                  	  self.dom.box.scrollLeft(orderDis);
                  	  self.order = null;
                  	  self.stop();
                  }else{
                  	  self.play();
                  }
                  $(this).dequeue();
             });
          } else {
        	  if(isOrder){
          		self.order = orderTo;
	          }else{
          		_dis = self.dom.box.scrollTop() + (self.moveVal * self.settings.step);

                  if (_dis % self.itemHeight > 0){
                    _dis -= (_dis % self.itemHeight);
                  };

                  if (_dis > _max){
                    _dis = _max;
                  };

                  self.dom.box.animate({
                    'scrollTop': _dis
                  }, _speed, self.settings.easing, function(){
                    if (parseInt(self.dom.box.scrollTop(), 10) >= _max) {
                      self.dom.box.scrollTop(0);
                    };
                  });
	          	}
	          self.dom.box.queue(function(){
                  self.lockState = false;
                  if(self.order){
                	  var orderDis = self.moveVal * (self.order - 1);
                  	  self.dom.box.scrollTop(orderDis);
                  	  self.order = null;
                  	  self.stop();
                  }else{
                  	  self.play();
                  }
                  $(this).dequeue();
              });
          };
          break;
  
        case 'right':
        case 'bottom':
          _max = 0;
         
          if (d === 'right'){
        	  if(isOrder){
          		self.order = orderTo;
              }else{
              	 if (parseInt(self.dom.box.scrollLeft(), 10) === 0) {
                  	self.dom.box.scrollLeft(self.itemSum * self.moveVal);
                  };

                  _dis = self.dom.box.scrollLeft() - (self.moveVal * self.settings.step);
                  if (_dis % self.itemWidth > 0) {
                    _dis -= (_dis % self.itemWidth) - self.itemWidth;
                  };

                  if (_dis < _max) {
                    _dis = _max;
                  };

                  self.dom.box.animate({
                    'scrollLeft': _dis
                  }, _speed, self.settings.easing, function(){
                    if (parseInt(self.dom.box.scrollLeft(), 10) <= _max) {
                      self.dom.box.scrollLeft(0);
                    };
                  });
              }
          	  self.dom.box.queue(function(){
                  self.lockState = false;
                  if(self.order){
                	  var orderDis = self.moveVal * (self.order - 1);
                  	  self.dom.box.scrollLeft(orderDis);
                  	  self.order = null;
                  	  self.stop();
                  }else{
                  	  self.play();
                  }
                  $(this).dequeue();
              });
          } else {
        	  if(isOrder){
          		self.order = orderTo;
              }else{
              	if (parseInt(self.dom.box.scrollTop(), 10) === 0) {
  	                self.dom.box.scrollTop(self.itemSum * self.moveVal);
  	            };
  	
  	            _dis = self.dom.box.scrollTop() - (self.moveVal * self.settings.step);
  	
  	            if (_dis % self.itemHeight > 0) {
  	                _dis-=(_dis%self.itemHeight)-self.itemHeight;
  	            };
  	
  	            if (_dis < _max){
  	                _dis = _max;
  	            };
  	
  	            self.dom.box.animate({
  	                'scrollTop': _dis
  	            }, _speed, self.settings.easing, function(){
  	                if (parseInt(self.dom.box.scrollTop(), 10) <= _max) {
  	                  self.dom.box.scrollTop(0);
  	                };
  	            });
              }
          	  self.dom.box.queue(function(){
                  self.lockState = false;
                  if(self.order){
                	  var orderDis = self.moveVal * (self.order - 1);
                  	  self.dom.box.scrollTop(orderDis);
                  	  self.order = null;
                  	  self.stop();
                  }else{
                  	  self.play();
                  }
                  $(this).dequeue();
              });
          };
          break;
        
        default:
          return;
      };//switch--end
    };
    
    return function(){
    	// 分配参数
    	var obj, settings;
        for (var i = 0, l = arguments.length; i < l; i++) {
          if (isJquery(arguments[i])) {
            obj = arguments[i];
          } else if (isElement(arguments[i])) {
            obj = $(arguments[i]);
          } else if (typeof arguments[i] === 'object') {
            settings = arguments[i];
          };
        };
        var scroller = new Scroller(obj, settings);
    	return scroller.api;
    };
})();//end--mqScroll
