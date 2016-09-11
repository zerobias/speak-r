!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t(require("ramda"),require("sanctuary"),require("debug")):"function"==typeof define&&define.amd?define(["ramda","sanctuary","debug"],t):e.speak-r=t(e.true,e.true,e.true)}(this,function(e,t,n){"use strict";function r(e,t){return t={exports:{}},e(t,t.exports),t.exports}e="default"in e?e.default:e,t="default"in t?t.default:t,n="default"in n?n.default:n;var i=r(function(t){var n=e,r=["type","R","string","number","operator","any","context","lexeme"],i=n.pipe(n.map(n.repeat(n.__,2)),n.fromPairs)(r),o={piped:[r.R,r.context,r.lexeme],inserted:[r.number,r.string,r.type,r.any],control:[r.operator]},p={pipe:"|>",toLast:"<-",quotes:['"',"'","`"],operators:["=>","->",",","<~","<-","_","<|>","|>","<|","==","+","-","^","!=","@","::"],op:{doubledots:"::",comma:",",dash:"_",arrow:"->",doublearrow:"=>",backpipe:"<|",middlepipe:"<|>",forwardpipe:"|>",equals:"==",plus:"+",minus:"-",map:"^"},type:{list:r,dict:i,cats:o}};t.exports=p}),o=r(function(t){var n=e,r=n.curry(function(e,t){return{type:e,value:t}});t.exports={Type:r("type"),R:r("R"),String:r("string"),Number:r("number"),Operator:r("operator"),Any:r("any"),Context:r("context")}}),p=r(function(t){var r=e,i=n,o=function(e,t){return r.isNil(t)?e:[e,t].join(":  ")},p=function(e){return function(t){return i(o(e,t))}},a=function(e){return function(t){return r.tap(p(e)(t))}},u=r.apply(r.pipe),s=function(e,t){return r.ifElse(r.is(Array),r.concat(e),r.append(r.__,e))(t)},c=function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];return u(r.reduce(s,[],e))},f=r.unless(r.is(Array),r.of),l=c(f,r.flip(r.contains)),d=r.is(String),h={type:r.prop("type"),val:r.prop("value"),head:r.prop("head"),tail:r.prop("tail")};t.exports={pipelog:a,log:p,isString:d,arrayify:f,toPipe:u,P:c,isContainOrEq:l,prop:h}}),a=r(function(n){var r=e,a=t,u=i,s=o,c=p,f=c.isString,l=(c.log("fabric"),c.pipelog("fabric"),function(e,t,n){var i=r.pipe(c.arrayify,r.allPass,a.either(r.__,r.F)),o=r.flip(r.concat)([e,a.Right]),p=r.pipe(r.defaultTo([]),c.arrayify,o,c.toPipe,a.either(r.__,r.identity));return r.when(i(t),p(n))}),d=function(){var e=r.anyPass(r.map(r.equals,u.quotes)),t=r.allPass(r.map(function(t){return r.pipe(t,e)},[r.head,r.last])),n=r.pipe(r.init,r.tail);return l(s.String,[f,t],[r.trim,n])},h=function(){var e=[["Array",Array],["Number",Number],["String",String],["Function",Function],["Object",Object],["Null",null],["RegExp",RegExp]],t=new Map(e),n=function(e){return!!f(e)&&t.has(e)};return l(s.Type,n,function(e){return t.get(e)})},y=(r.propOr(!0,"isLeft"),l(s.Number,isFinite,parseFloat)),m=function(){var e=r.is(Function),t=function(t){return e(r[t])};return l(s.R,[f,t],r.prop(r.__,r))},v=function(e){return r.pipe(r.match(/\D\w+/),r.head,r.equals(e))(e)},x=l(s.Context,v),g=a.lift(r.when(f,r.trim)),b=(r.pipe(r.identity,r.assoc("warning","left-sided value")),r.identity);n.exports={isQuote:d(),isType:h(),isVendor:m(),isNumber:y,isContext:x,preprocess:g,postprocess:b}}),u=r(function(t){var n=e,r={pipe:"Pipe",context:"Context",atomic:"AtomicFunc",expr:"Expression"},i=function(e,t){return t.index=t.head.index,t.lexeme=e,t},o=function(e,t){console.error("\n!!!!!!------------Used deprecated Lexeme object!\n"),this.lexeme=e,this.index=t.index,this._value=t.value,this.type="lexeme"},p={value:{}},a={its:{}};o.Pipe=function(e){return new i(r.pipe,e)},o.AtomicFunc=function(e){return new i(r.atomic,e)},o.Expression=function(e){return new i(r.expr,e)},a.its.get=function(){var e=n.propEq("lexeme");return n.map(e,r)},o.Context=function(e){return new o(r.context,e)},p.value.get=function(){return console.error("\n!!!!!!------------Used deprecated get method!\n"),this._value},p.value.set=function(e){console.error("\n!!!!!!------------Used deprecated set method!\n"),this._value=e},Object.defineProperties(o.prototype,p),Object.defineProperties(o,a),t.exports=o}),s=r(function(n){var r=e,i=t,o=p,a=o.P,u=function(e,t){return!r.is(Array,e)||r.isEmpty(e)?i.Left("No array recieved"):void(r.isNil(t)?(this.head=r.head(e),this.tail=r.tail(e)):(this.head=t,this.tail=e||[]))},s={toArray:{},length:{}};u.prototype.map=function(e){return r.map(e,this.toArray)},s.toArray.get=function(){return r.prepend(this.head,this.tail)},s.length.get=function(){return r.defaultTo(0,this.tail.length)+r.isEmpty(this.head)?0:1},u.prototype.append=function(e){return r.isEmpty(this.tail)&&r.isEmpty(this.head)?this.head=e:this.tail.push(e),this},u.hasTail=function(e){return r.has("tail",e)&&!r.isEmpty(e.tail)},u.last=function(e){return u.hasTail(e)?r.last(e.tail):e.head},u.lastR=function(e,t){void 0===t&&(t=!1);var n=r.has("tail"),i=a(n,r.not),o=r.either(i,a(u.last,i));return r.until(t?o:i,u.last)(e)},u.emptyList=function(){return new u([{}])},u.isList=function(e){return r.has("head",e)},Object.defineProperties(u.prototype,s),n.exports=u}),c=r(function(n){function r(e){var t=function(e,t){return y.lift(h.assoc("index",t))(e)},n=function(e){return e.map(t)};return v(h.map(y.eitherToMaybe),n)(e)}function o(e,t,n){var r=v(h.length,h.dec,h.lensIndex),i=function(e){return h.append(b.Pipe(new w([e])))},o=function(e){return function(t){return h.ifElse(h.isEmpty,i(e),h.over(r(t),n(e)))(t)}},p=h.map(h.ifElse(e,t,o));return h.transduce(p,function(e,t){return t(e)})}function a(e){var t=function(e){return v(m.arrayify,h.append(e.value))},n=v(x.val,_([E.R,E.operator,E.context])),r=v(x.val,h.of,h.append),i=o(n,r,t);return i([],e)}function c(e){var t=function(e){return function(t){return t.append(e)}},n=h.anyPass([R.forwardpipe,R.middlepipe,R.backpipe]),r=h.both(w.isList,v(x.head,n)),i=v(h.identity,h.append),p=o(r,i,t);return p([],e)}function f(e){var t=[[R.dash,E.any,h.__],[R.equals,E.R,h.equals],[R.plus,E.R,h.add],[R.minus,E.R,h.subtract],[R.map,E.R,h.map]],n=function(e,t){return function(n){return n.value=t,n.type=e,n}},r=function(e,t,r){return h.map(h.when(e,n(t,r)))},i=function(e,t){return h.apply(r,t)(e)},o=function(e){return function(t){return h.reduce(i,t,e)}},p=o(t);return p(e)}function l(e){var t=h.when(v(x.head,_(E.R)),b.AtomicFunc),n=h.when(v(x.head,_(E.operator)),b.Expression),r=v(function(e){return new w(e)},t,n),i=v(y.lift(f),a,h.map(r));return i(e)}function d(e){return v(r,l,c)(e)}var h=e,y=t,m=p,v=m.P,x=m.prop,g=i,b=u,w=s,N=g.op,E=g.type.dict,P=h.propEq("value"),_=function(e){return v(x.type,m.isContainOrEq(e))},T=_(E.operator),L=function(e){return h.allPass([T,P(e)])},R=h.map(L,N);n.exports=d}),f=r(function(t){var n=e,r=p,a=o,u=r.pipelog("splitter"),s=i.operators,c=r.toPipe,f=function(e){return n.map(n.when(r.isString,e))},l=f(n.trim),d=n.reject(n.isEmpty),h=[n.split,n.pipe(a.Operator,n.intersperse)],y=[d,n.unnest],m=function(e){return n.cond([[n.is(String),e],[n.T,u("uncaught")]])},v=function(e){return n.pipe(e,n.unnest)},x=[n.of,n.ap(h),n.concat(n.__,y),c,m,n.map,v,u("splitPipe")],g=n.pipe(c,n.map(n.__,s),c)(x),b=n.pipe(n.unnest,l,d,u("end")),w=[r.arrayify,g,b],N=c(w);t.exports={exec:N,cleaner:b}}),l=r(function(n){var r=e,i=t,o=a,u=f,s=p,c=(s.log("preproc"),s.pipelog("preproc")),l=r.pipe(o.preprocess,c("->isQuote"),o.isQuote,c("->isNumber"),o.isNumber,c("->isType"),o.isType,c("->isVendor"),o.isVendor,c("->isContext"),o.isContext,c("->postprocess"),o.postprocess),d=r.unary(r.pipe(r.unless(s.isString,function(){throw new Error("`keywords` should be String")}),r.split(" "),r.reject(r.isEmpty),u.exec,r.map(r.ifElse(r.is(Object),i.Right,i.Left)),c("тэг"),r.map(l),r.dropRepeatsWith(function(e,t){return r.allPass([r.propEq("type","operator"),r.propEq("obj",","),r.eqProps("obj",r.__,t)])(e)})));n.exports=d}),d=r(function(n){function r(e){var t=c.when(y.its.expr,d(l.prop.tail,function(e){return new h(e)},y.Pipe)),n=c.when(c.both(y.its.pipe,d(h.hasTail,c.not)),l.prop.head);return d(t,n)(e)}function o(){var e=this;this.value=[],this.push=function(t){return e.value.push(L(t))},this.pushLast=function(t){return e.push(h.lastR(t,!0))},this.pop=function(){return e.value.pop()},this.addToLast=function(t){return c.last(e.value)(t)}}function a(e){if(!c.is(Array,e))return f.Left("No array recieved");for(var t=h.emptyList(),n=new o,i=N.empty,p=c.append([c.T,N.pipe],c.map(function(e){return[_[e],function(){return N[e]}]},w)),a=0;a<e.length;){var u=e[a],s=c.cond(p)(u),l=T[i][s];switch(l){case E.child:n.pushLast(t);break;case E.parent:n.pop()}i=s,n.addToLast(r(u)),a++}return d(y.Pipe,r)(t)}var c=e,f=t,l=p,d=l.P,h=(l.log("tree"),l.pipelog("tree"),s),y=u,m=i,v=m.type.dict,x=m.op,g=function(e){return function(t){return c.whereEq({type:e,value:t})}},b=g(v.operator),w=["pipe","open","mid","close"],N={empty:0,pipe:1,open:2,mid:3,close:4},E={next:0,child:1,parent:-1,error:NaN},P=function(e){return c.both(y.its.expr,d(l.prop.head,b(e)))},_={pipe:y.its.pipe,open:P(x.backpipe),mid:P(x.middlepipe),close:P(x.forwardpipe)},T=[[NaN,1,1,NaN,1],[NaN,0,1,NaN,0],[NaN,-1,1,0,-1],[NaN,-1,1,0,-1],[NaN,0,1,NaN,0]],L=function(e){return function(t){return e.append(t)}};n.exports=a}),h=r(function(n){var r=e,i=t,o=p,a=o.P,u=o.log("tree"),c=(o.pipelog("tree"),s),f=function(){},l={funcReplace:{},pair:{},typeOrOper:{}};f._indexTag=function(e){return function(t,n){return void 0===n&&(n=" "),a(o.arrayify,r.prepend(e),r.join(n),u)(t)}},f.arr=function e(t,e){var n=f._indexTag(t);return e.forEach(function(e,t){return n(t)(e)})},l.funcReplace.get=function(){return r.when(a(r.last,r.is(Function)),function(e){return[e[0],"FUNC"]})},l.pair.get=function(){return a(r.toPairs,r.map(f.funcReplace()))},f.to=function(e){return a(i.maybeToNullable,e)},l.typeOrOper.get=function(){return r.ifElse(isOperator,prop.val,prop.type)},f.headList=function(e,t,n,i){void 0===n&&(n=0),void 0===i&&(i=0);var o=f._indexTag(e),p=" ",u=a(r.repeat(p),r.join("")),s=["value"],l=function(e){return function(t){return o(["",u(i),e,t[0]],"")(t[1])}},d=function(e){return a(r.props(e),r.zip(e),r.forEach(l(p)))},h=function(e){return e===-1?"#":e+1+(e+1>=10?" ":"")},y=r.add(2,i);c.isList(t)?(l(h(n))([t.lexeme,t.index]),f.headList(e,t.head,-1,y),c.hasTail(t)&&t.tail.forEach(function(t,n){return f.headList(e,t,n,y)})):(l(h(n))([t.type,t.index]),d(s)(t))},Object.defineProperties(f,l),n.exports=f}),y=r(function(t){function n(e){this.message="Can not compile object "+e,this.name="Compile exeption"}function r(e){var t=c.cond([[c.is(Array),i],[h(f.isList,c.not),d.prop.val],[l.its.pipe,i],[l.its.atomic,o],[c.T,function(e){throw new n(e)}]]);return t(e)}function i(e){var t=c.when(f.isList,c.prop("toArray"));return h(t,c.map(r),c.apply(c.pipe))(e)}function o(e){return f.hasTail(e)?c.apply(r(e.head),c.map(r,e.tail)):r(e.head)}function a(e){return r(e)}var c=e,f=s,l=u,d=p,h=d.P;t.exports=a}),m=r(function(t){function n(e){return s(i,o,a,r.tap(function(e){return m.headList("conv",e,-1)}),v)(e)}var r=e,i=l,o=c,a=d,u=p,s=u.P,f=u.log("index"),m=h,v=y,x="when <| == 1 not <|> + 10 |> + 100";f("example")(x);var g=n(x),b=g(1);f("word")(b),t.exports=n});return m});
//# sourceMappingURL=speak-r.js.map
