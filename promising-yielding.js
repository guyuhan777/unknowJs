function foo(x,y) {
 return request(
 "http://some.url.1/?x=" + x + "&y=" + y
 );
}
function *main() {
 try {
 var text = yield foo( 11, 31 );
 console.log( text );
 }
 catch (err) {
 console.error( err );
 }
} 

