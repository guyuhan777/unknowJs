if(!Promise.wrap){
	Promise.wrap = function(fn){
		return function(){
			var args = [].slice.call(arguments);
			return new Promise( function(resolve, reject){
				fn.apply(
					null,
					args.concat( function(err, v){
						if(err){
							reject(err);
						}else{
							resolve(v);
						}
					}));
			});
		}
	}
}