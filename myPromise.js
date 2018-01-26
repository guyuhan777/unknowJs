var mPromise = (function(){
	function MyPromise(resolver){
		if(typeof resolver !== 'function'){
			throw new TypeError(resolver + ' is not a function');
		}
		if(!(this instanceof MyPromise) return new MyPromise(resolver);

		var self = this;

		self.status_ = 'PENDING';
		self.data_ = undefined;
		self.resolveCallBacks = [];
		self.rejectCallBacks = [];

		function resolve(value){
			setTimeout(function(){
				if(self.status_ === 'PENDING'){
					self.status_ = 'RESOLVED';
					self.data_ = value;
					for(var i=0; i<self.rejectCallBacks.length; i++){
						self.rejectCallBacks[i](value);
					}
				}
			});
		}

		function reject(reason){
			setTimeout(function(){
				if(self.status_ === 'PENDING'){
					self.status_ = 'REJECTED';
					self.data_ = reason;
					for(var i=0; i<self.resolveCallBacks.length; i++){
						self.resolveCallBacks[i](value);
					}
				}
			});
		}

		try{
			resolver(resolve, reject);
		}catch(reason){
			reject(reason);
		}
	}

	function resolvePromise(mPromise, x, resolve, reject){
		var then;
		var thenCalledOrThrow = false;
		if(mPromise === x){
			return reject(new TypeError('Circle is not expected to exist'));
		} // Promises/A+ 2.3.1

		if(x instanceof MyPromise){ // 2.3.2
			if(x.status_ === 'PENDING'){
				x.then(function(value){
					resolvePromise(mPromise, value, resolve, reject)
				}, reject);
			}else{
				x.then(resolve, reject);
			}
			return;
		}

		if((x != null) && ((typeof x === 'object') || (typeof x === 'function'))){ // 2.3.3
			try{
				then = x.then; // Maybe then is a getter 2.3.3.1
				if(typeof then === 'function'){ // 2.3.3.3
					then.call(x, function rs(y){
						if(thenCalledOrThrow) return;
						thenCalledOrThrow = true;
						return resolvePromise(mPromise, y, resolve, reject); // 2.3.3.3.1
					}, function rj(r){
						if(thenCalledOrThrow) return;
						thenCalledOrThrow = true;
						return reject(r); // 2.3.3.3.2
					});
				}else{
					return resolve(x); // 2.3.3.4 
				}
			}catch(reason){ // 2.3.3.2
				if(thenCalledOrThrow) return;
				thenCalledOrThrow = true;
				return reject(reason);
			}
		}else{
			return resolve(x); // 2.3.4
		}
	}

	MyPromise.prototype.then = function(onResolved, onRejected) {
		onResolved = typeof onResolved === 'function' ? onResolved : function(value){return value};
		onRejected = typeof onRejected === 'function' ? onRejected : function(reason){throw reason};

		var self = this;
		var newPromise;
		if(self.status_ === 'RESOLVED'){
			newPromise = new MyPromise(function(resolve, reject){
				setTimeout(function(){
					try{
						var x = onResolved(self.data_);
						resolvePromise(newPromise, x, resolve, reject);
					}catch(reason){
						reject(reason);
					}
				});
			});
		}else if(self.status_ === 'REJECTED'){
			newPromise = new MyPromise(function(resolve, reject){
				setTimeout(function(){
					try{
						var x = onRejected(self.data_);
						resolvePromise(newPromise, x, resolve, reject);
					}catch(reason){
						reject(reason);
					}
				});
			});
		}else{
			newPromise = new MyPromise(function(resolve, reject){
				self.resolveCallBacks.push(function(){
					try{
						var x = onResolved(self.data_);
						resolvePromise(newPromise, x, resolve, reject);
					}catch(reason){
						rejcet(reason);
					}
				});
				self.rejectCallBacks.push(function(){
					try{
						var x = onRejected(self.data_);
						resolvePromise(newPromise, x, resolve, reject);
					}catch(reason){
						reject(reason);
					}
				});
			});
		}
		return newPromise;
	};

	return Promise;
});