var Ring=new function(){function e(e,n,o,i){t(e,n,o,i),a(l)}function t(e,t,n,o){S=r(t),P.materialName=t,P.fontName=o,P.text=e,P.modelUrl="models/"+n+".js",m(e)?(P.type="shape",P.shapeUrl="models/"+e.substring(1,e.length-1)+".js",P.fontUrl="fonts/"+o+".json"):(P.type="text",P.fontUrl="fonts/"+o+".json"),"9-1"==n?"text"==P.type&&(P.rotationCalibrated.set(0,0,0),P.positionCalibrated.set(0,0,0),P.cutFlag=!0):"9-2"==n?("text"==P.type?(P.rotationCalibrated.set(0,0,0),P.positionCalibrated.set(0,0,0),P.cutFlag=!0):"shape"==P.type&&(P.rotationCalibrated.set(0,0,0),P.positionCalibrated.set(0,0,-20)),P.cutFlag=!0):"9-3"==n?"text"==P.type&&(P.textHeight=150,P.rotationCalibrated.set(0,0,6/180*Math.PI),P.positionCalibrated.set(0,37,0),P.cutFlag=!1):"9-4"==n?"text"==P.type&&(P.rotationCalibrated.set(0,0,0),P.positionCalibrated.set(-5,0,-20),P.cutFlag=!0):"9-5"==n&&"text"==P.type&&(P.rotationCalibrated.set(0,0,0),P.positionCalibrated.set(0,0,0),P.cutFlag=!0,P.depth=50)}function n(e,n){if("text"==e)P.text=n,m(P.text)?P.type="shape":P.type="text",F.remove(z),F.remove(C),L.remove(F),F=new THREE.Object3D,l(U.ringGeometry.clone());else if("height"==e)console.log(n/P.height),F.scale.y=n/P.height;else if("material"==e){var o=r(n);F.children[0].material=o,F.children[1].material=o}else if("model"==e){t(P.text,P.materialName,n,P.fontName),F.remove(z),F.remove(C),L.remove(F),F=new THREE.Object3D,P.modelUrl="models/"+n+".js";var i=new THREE.JSONLoader;i.load(P.modelUrl,function(e,t){U.ringGeometry=e.clone(),l(e)})}}function o(e){switch(e){case"text":return P.text;case"height":return P.height}}function i(e,t){var n=new THREE.MeshPhongMaterial(e);return n.name=t,n}function r(e){for(var t=0;t<j.length;t++)if(j[t].name==e)return j[t];return j[0]}function a(e){function t(){o.load(P.fontUrl,function(t){n=t,U.font=n,i.load(P.modelUrl,function(t,n){U.ringGeometry=t.clone(),e(t)})})}var n,o=new THREE.FontLoader,i=new THREE.JSONLoader;"shape"==P.type?i.load(P.shapeUrl,function(e,n){U.shapeGeometry=e,t()}):"text"==P.type&&t()}function l(e){"shape"==P.type?C=E(U.shapeGeometry.clone()):"text"==P.type&&(C=p(P.text,U.font)),z=d(e)}function s(){B=new THREE.PerspectiveCamera(45,window.innerWidth/window.innerHeight,1,1e4),B.position.set(0,0,2e3),T=document.getElementById("container"),M=new THREE.TrackballControls(B,T),M.rotateSpeed=1,M.zoomSpeed=1.2,M.panSpeed=.8,M.noZoom=!1,M.noPan=!1,M.staticMoving=!0,M.dynamicDampingFactor=.3,L=new THREE.Scene,e=new THREE.DirectionalLight(16777190,.95),e.position.set(0,100,200),L.add(e),e=new THREE.DirectionalLight(16777190,.75),e.position.set(0,-100,-200),L.add(e);var e=new THREE.HemisphereLight(13365758,16773846,.4);L.add(e);var e=new THREE.AmbientLight(4210752);L.add(e),V=new THREE.WebGLRenderer({antialias:!0}),V.setPixelRatio(window.devicePixelRatio),V.setClearColor(16777215),V.setSize(window.innerWidth,window.innerHeight),T.appendChild(V.domElement),f=new Stats,f.domElement.style.position="absolute",f.domElement.style.top="0px",f.domElement.style.zIndex=100,T.appendChild(f.domElement),window.addEventListener("resize",v,!1)}function d(e){function t(e,t,n){return!!(P.cutFlag&&e.distanceToPoint(n)>0&&t.distanceToPoint(n)>0)}var n,o=new THREE.Vector3,i=[],r=[],a=[],l=[],s=(new THREE.Matrix4).makeRotationX(-Math.PI/2).multiply((new THREE.Matrix4).makeScale(50,50,50));e.applyMatrix(s),e.verticesNeedUpdate=!0,e.computeBoundingBox(),n=(e.boundingBox.max.x-e.boundingBox.min.x)/2,o.set(n+e.boundingBox.min.x,0,n+e.boundingBox.min.z),P.height=e.boundingBox.max.y-e.boundingBox.min.y;var d=(C.width/2-7)/(n+C.depth/2),g=(new THREE.Vector3).crossVectors(new THREE.Vector3(0,0,1).applyAxisAngle(new THREE.Vector3(0,1,0),d).normalize(),new THREE.Vector3(0,1,1).applyAxisAngle(new THREE.Vector3(0,1,0),d).normalize()),m=(new THREE.Vector3).crossVectors(new THREE.Vector3(0,0,1).applyAxisAngle(new THREE.Vector3(0,1,0),-d).normalize(),new THREE.Vector3(0,1,1).applyAxisAngle(new THREE.Vector3(0,1,0),-d).normalize()),u=new THREE.Plane;u.setFromNormalAndCoplanarPoint(g.normalize(),o);var E=new THREE.Plane;E.setFromNormalAndCoplanarPoint(m.normalize().negate(),o);for(var p=0;p<e.faces.length;p++){var w=e.faces[p],x=e.vertices[w.a],R=e.vertices[w.b],v=e.vertices[w.c],b=[x,R,v],H=[0,0,0],T=[],f=[];t(u,E,x)&&(H[0]=1),t(u,E,R)&&(H[1]=1),t(u,E,v)&&(H[2]=1);for(var B=0;B<H.length;B++)H[B]?f.push(b[B]):T.push(b[B]);if(0==f.length)i.push(x,R,v),r.push(new THREE.Face3(i.length-1,i.length-2,i.length-3));else if(1==f.length){var M,V,U=new THREE.Line3(f[0],T[0]),j=new THREE.Line3(f[0],T[1]),N=1,G=1;void 0!=(M=u.intersectLine(U))?N=1:(M=E.intersectLine(U),N=2),void 0!=(V=u.intersectLine(j))?G=1:(V=E.intersectLine(j),G=2),i.push(T[0],T[1],M,V);var A=h(i[i.length-1].clone(),o,n-20).sub(M.clone());r.push(c(i,i.length-1,i.length-2,i.length-3,A)),r.push(c(i,i.length-2,i.length-3,i.length-4,A)),1==N?a.push(i.length-2):l.push(i.length-2),1==G?a.push(i.length-1):l.push(i.length-1)}else if(2==f.length){var M,V,U=new THREE.Line3(T[0],f[0]),j=new THREE.Line3(T[0],f[1]),N=1,G=1;void 0!=(M=u.intersectLine(U))?N=1:(M=E.intersectLine(U),N=2),void 0!=(V=u.intersectLine(j))?G=1:(V=E.intersectLine(j),G=2),i.push(T[0],M,V);var A=h(i[i.length-1].clone(),o,n-20).sub(M.clone());r.push(c(i,i.length-1,i.length-2,i.length-3,A)),1==N?a.push(i.length-2):l.push(i.length-2),1==G?a.push(i.length-1):l.push(i.length-1)}}var D=new THREE.Geometry;D.vertices=i,D.faces=r;var O=[],k=[],I=new THREE.Geometry;O.push(i[a[0]],i[l[0]]);for(var A=new THREE.Vector3(0,0,(-1)),p=2;p<a.length;p++)O.push(i[a[p-1]],i[a[p]]),k.push(c(O,0,O.length-1,O.length-2,A));for(var p=2;p<l.length;p++)O.push(i[l[p-1]],i[l[p]]),k.push(c(O,1,O.length-1,O.length-2,A));I.vertices=O,I.faces=k,I.mergeVertices(),I.computeFaceNormals(),I.computeVertexNormals(),D.mergeVertices(),D.computeFaceNormals(),D.computeVertexNormals();var W=new THREE.Mesh(I,S);z=new THREE.Mesh(D,S),F.add(W),L.add(z),F.add(z),C=y(o,n,C),C.position.copy(P.positionCalibrated),C.position.y-=P.textHeight/2,C.rotation.copy(P.rotationCalibrated),F.add(C),L.add(F)}function c(e,t,n,o,i){var r=g(e[t].clone(),e[n].clone(),e[o].clone());return i.angleTo(r)<=Math.PI/2?new THREE.Face3(t,n,o):new THREE.Face3(o,n,t)}function g(e,t,n){var o=new THREE.Vector3,i=new THREE.Vector3;return o.subVectors(n,t),i.subVectors(e,t),o.cross(i),o.normalize()}function h(e,t,n){var o=e.sub(t.clone().setY(e.y));return o.setLength(n)}function m(e){var t=/\[\S+\]/g;return t.test(e)}function u(e){return e>="A"&&e<="Z"||"p"==e||"s"==e||"1"==e}function E(e){var t=new THREE.Mesh(e,S);return t.geometry.applyMatrix((new THREE.Matrix4).makeScale(50,50,50)),t.geometry.computeBoundingBox(),t.width=t.geometry.boundingBox.max.x-t.geometry.boundingBox.min.x,t.height=t.geometry.boundingBox.max.y-t.geometry.boundingBox.min.y,t.depth=t.geometry.boundingBox.max.z-t.geometry.boundingBox.min.z,t.geometry.applyMatrix((new THREE.Matrix4).setPosition(new THREE.Vector3(t.width/2,t.height/2,t.depth/2))),t}function p(e,t){for(var n,o=0,i=0,r=0;r<e.length;r++)u(e[r])||r==e.length-1?(i&&(i=0,n=x(n,e.substring(o,r),t)),n=x(n,e[r],t)):i||(i=1,o=r);return n.geometry.computeBoundingBox(),n.width=n.geometry.boundingBox.max.x-n.geometry.boundingBox.min.x,n.height=n.geometry.boundingBox.max.y-n.geometry.boundingBox.min.y,n.depth=n.geometry.boundingBox.max.z-n.geometry.boundingBox.min.z,n}function w(e,t){return new THREE.TextGeometry(e,{size:P.textHeight,height:P.depth,curveSegments:4,font:t,weight:"bold",style:"normal",bevelEnabled:!0,bevelThickness:2,bevelSize:1})}function x(e,t,n){if(void 0===e)return new THREE.Mesh(w(t,n),S);e.geometry.computeBoundingBox();var o=e.geometry.clone(),i=w(t,n);o.computeBoundingBox(),i.computeBoundingBox();var r=o.boundingBox.max.x-o.boundingBox.min.x,a=i.boundingBox.max.x-o.boundingBox.min.x,l=i.boundingBox.max.y-o.boundingBox.min.y,s=!1,d=new THREE.Vector3(r,0,0);do{for(var c=d.clone().add(new THREE.Vector3(a/2,l/2,0)),g=0;g<i.vertices.length;g++)if(!(i.vertices[g].z!=c.z||i.vertices[g].x>=a/2)){var h=i.vertices[g].clone(),m=h.sub(new THREE.Vector3(a/2,l/2,0)),u=new THREE.Raycaster(c,m.clone().normalize()),E=u.intersectObject(e);if(E.length>0&&E[0].distance<m.length()){s=!0,o.merge(i,(new THREE.Matrix4).setPosition(d));break}}d.x-=3}while(!s);return new THREE.Mesh(o,S)}function y(e,t,n){var o=(new THREE.Matrix4).setPosition(new THREE.Vector3(-n.width/2,0,0));n.geometry.applyMatrix(o);for(var i=t+n.depth/2,r=2*i*Math.PI,a=0;a<n.geometry.vertices.length;a++){var l=n.geometry.vertices[a],s=t-l.z,d=l.x,c=d/r*Math.PI*2;n.geometry.vertices[a].set(s*Math.sin(c),l.y,s*Math.cos(c)).add(e)}return n.geometry.verticesNeedUpdate=!0,n.geometry.mergeVertices(),n.geometry.computeFaceNormals(),n.geometry.computeVertexNormals(),n}function R(e){var t;if(e=e.toLowerCase(),window.URL=window.URL||window.webkitURL,window.BlobBuilder=window.BlobBuilder||window.WebKitBlobBuilder||window.MozBlobBuilder,"obj"==e){var n=new THREE.OBJExporter;t=n.parse(L)}else if("stl"==e){var n=new THREE.STLExporter;t=n.parse(L)}var o=document.createElement("a");o.style.display="none",document.body.appendChild(o),o.href=URL.createObjectURL(new Blob([t],{type:"text/plain"})),o.download="model."+e,o.click()}function v(){B.aspect=window.innerWidth/window.innerHeight,B.updateProjectionMatrix(),V.setSize(window.innerWidth,window.innerHeight)}function b(){requestAnimationFrame(b),H()}function H(){f.update(),M.update(),V.render(L,B)}(new Date).getTime();Detector.webgl||Detector.addGetWebGLMessage();var T,f,B,M,L,V,C,z,S,F=new THREE.Object3D,P={text:"hello",depth:70,height:0,type:"text",textHeight:158,shapeUrl:"",modelUrl:"",fontUrl:"",materialName:"gold_yellow",fontName:"",positionCalibrated:new THREE.Vector3(0,0,0),rotationCalibrated:new THREE.Euler(0,0,0),cutFlag:!0},U={font:null,shapeGeometry:null,ringGeometry:null,textMesh:null},j=[],N=["img/px.jpg","img/nx.jpg","img/py.jpg","img/ny.jpg","img/pz.jpg","img/nz.jpg"],G=THREE.ImageUtils.loadTextureCube(N);return G.format=THREE.RGBFormat,j.push(i({color:16764482,specular:3355443,combine:THREE.MixOperation,envMap:G,shininess:54,reflectivity:.75,side:THREE.DoubleSide,shading:THREE.SmoothShading},"gold_yellow")),j.push(i({color:16750995,specular:3355443,combine:THREE.MixOperation,envMap:G,shininess:54,reflectivity:.75,side:THREE.DoubleSide,shading:THREE.SmoothShading},"gold_red")),j.push(i({color:16777215,specular:16777215,combine:THREE.MixOperation,envMap:G,shininess:54,reflectivity:.75,side:THREE.DoubleSide,shading:THREE.SmoothShading},"silver")),s(),b(),{init:function(t,n,o,i){return t.length>13?void alert("文字太长"):void e(t,n,o,i)},change:function(e,t){n(e,t)},get:function(e){return o(e)},"export":function(e){R(e)}}};