var Ring = new function() {

	if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

	var container, stats;

	var camera, controls, scene, renderer;
	var font;
	var ringBody;

	var materials = [];
	var goldMaterial = new THREE.MeshPhongMaterial( { color: 0xffce42 } );

	var ringMatetial = new THREE.MeshPhongMaterial( { color: 0xffce42 , specular : 0x333333, combine : THREE.MixOperation, shininess : 40, reflectivity: 0.55 } );

	var mouse = new THREE.Vector2();
	var projector = new THREE.Projector();
	var modifier = new THREE.BendModifier();

	var direction = new THREE.Vector3( 0, 0, -1 );
		var axis =  new THREE.Vector3( 0, 1, 0 );
		var angle = Math.PI / 6;



	var Plane;

	init();
	animate();

	

	function init() {

		// camera

		AddCamera(0, 0, 2000);

		scene = new THREE.Scene();

		// lights

		light = new THREE.DirectionalLight( 0xffffff );
		light.position.set( 0, 100, 200 );
		scene.add( light );

		light = new THREE.DirectionalLight( 0xffffff );
		light.position.set( 0, -100, -200 );
		scene.add( light );

		// renderer

		renderer = new THREE.WebGLRenderer( { antialias: true } );
		renderer.setClearColor( 0xffffff );
		renderer.setSize( window.innerWidth, window.innerHeight );

		container = document.getElementById( 'container' );
		container.appendChild( renderer.domElement );

		stats = new Stats();
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.top = '0px';
		stats.domElement.style.zIndex = 100;
		container.appendChild( stats.domElement );

		//

		window.addEventListener( 'resize', onWindowResize, false );
		// document.addEventListener( 'mousedown', onDocumentMouseDown, false );

		// world


	}

	function start( text ){

		// var mesh = new THREE.Mesh(
		// 		new THREE.BoxGeometry(1000,200,200),
		// 		ringMatetial
		// 	);
		// mesh.geometry.computeMorphNormals ();
		// mesh.geometry.normalsNeedUpdate = true;
		// mesh.geometry.elementsNeedUpdate = true;
		// mesh.geometry.computeFaceNormals()
		// for(var i=0;i<mesh.geometry.faces.length;i++){
		// 	var face = mesh.geometry.faces[i];
		// 	// face.normal.set(0,0,i*0.1).normalize();
		// 	face.normal.copy( new THREE.Vector3(0,0,Math.sin(i*0.01)) );
		// 	console.log(face.normal);
		// }
		// mesh.geometry.normalsNeedUpdate = true;
		// mesh.geometry.elementsNeedUpdate = true;
		// mesh.geometry.computeFaceNormals()


		// scene.add(mesh);
		// console.log(mesh);




		var loader = new THREE.FontLoader();
		loader.load( 'fonts/Script_MT_Bold_Regular.json', function ( response ) {
			font = response;
			textMeshBuild( text );

		} );
	}

	function isSpecial( c ){
		if( c>='A'&&c<='Z' || c=='p' || c=='s' || c>='0' &&c<='9' )
			return true;
		return false;
	}

	function linkSplit( text ){
		var textArr = [];
		var start = 0;
		var flag = 0;
		for( var i = 0; i < text.length - 1; i++ ){
			if( isSpecial( text[i] ) ){
				if( flag ){
					flag = 0;
					textArr.push( text.subString( start, i ) );
				}
				textArr.push( text[i] );
			}else{
				if( !flag ){
					flag = 1;
					start = i;
				}
			}
		}

		return textArr;
	}


	function textMeshBuild( text ){

		console.log(text);
		var textArr=[];

		// var text = "pqqp";
		var textMesh;
		var start = 0;
		var flag = 0;

		for( var i = 0; i < text.length ; i++ ){
			if( isSpecial( text[i] )|| i == text.length-1 ){
				if( flag ){
					flag = 0;
					textMesh = textMeshPush( textMesh, text.substring( start, i ) );
				}
				textMesh = textMeshPush( textMesh, text[i] );
			}else{
				if( !flag ){
					flag = 1;
					start = i;
				}
			}
		}
		var direction = new THREE.Vector3( 0, 0, -1 );
		var axis =  new THREE.Vector3( 0, 1, 0 );
		var angle = Math.PI / 6;
		// modifier.set( direction, axis, angle ).modify( textMesh.geometry );
		textMesh.geometry.computeBoundingBox();

		textMesh.width = textMesh.geometry.boundingBox.max.x -  textMesh.geometry.boundingBox.min.x;
		textMesh.height = textMesh.geometry.boundingBox.max.y - textMesh.geometry.boundingBox.min.y;

		// console.log(width);
		console.log(textMesh.width)
		textMesh.position.set(-textMesh.width/2+80,-textMesh.height/2,430 +40)
		// scene.add(textMesh);

		// var arrowHelper = new THREE.ArrowHelper( new THREE.Vector3(0,0,-1), textMesh.position, 200, 0xff0000 );
		// scene.add( arrowHelper );
		// 
		var radius = 960;

		var theta = (textMesh.width/(radius*2*Math.PI))*Math.PI*2;
		modifier.set( direction, axis, theta ).modify( textMesh.geometry );
		textMesh.geometry.computeBoundingBox();
		console.log(textMesh.geometry.boundingBox.max.x -  textMesh.geometry.boundingBox.min.x)

		var bbox1 = new THREE.BoundingBoxHelper( textMesh, 0xff0000 );
		bbox1.update();
		bbox1.geometry.computeBoundingBox();
		// scene.add( bbox1 );
		// console.log(bbox1);
		// var bbox1 = new THREE.Box3().setFromObject( textMesh );
		console.log(bbox1.geometry);
		var box1 = new THREE.Box3().setFromObject(textMesh);
		var center1 = bbox1.position.clone().add( new THREE.Vector3(0,0,(box1.max.z - box1.min.z)/2));
		var arrowHelper = new THREE.ArrowHelper( new THREE.Vector3(0,0,-1), center1, 200, 0xff0000 );
		// scene.add( arrowHelper );

		var ringBody = ringBodyBuild(50,textMesh.height,radius,theta);
		var bbox2 = new THREE.BoundingBoxHelper( ringBody, 0xff0000 );
		bbox2.update();
		bbox2.geometry.computeBoundingBox();
		// scene.add( ringBody );
		var box2 = new THREE.Box3().setFromObject(ringBody);
		var center2 = bbox2.position.clone().add( new THREE.Vector3(0,0,(box2.max.z-box2.min.z)/2 ));
		var arrowHelper = new THREE.ArrowHelper( new THREE.Vector3(0,0,-1), center2, 200, 0xff0000 );
		// scene.add( arrowHelper );


		textMesh.position.add( center2.sub(center1) );
		// bbox1.update();
		// var bsp1 = new ThreeBSP( ringBody );
		// var bsp2 = new ThreeBSP( bbox1 );
		// var geometry = bsp1.subtract( bsp2 ).toGeometry();
		// var mesh = new THREE.Mesh( geometry, ringMatetial );
		scene.add(ringBody);

	}

	function createFontGeometry( text ) {

		return new THREE.TextGeometry( text,{
						size: 158,
						height: 50,
						curveSegments: 4,
						font: font,
						weight: "bold",
						style: "normal",
						bevelEnabled: true,
						bevelThickness: 2,
						bevelSize: 1,
					});
	}

	function textMeshPush( textMesh, text ){

		if( textMesh === undefined ){
			return new THREE.Mesh( 
				createFontGeometry( text ),
				ringMatetial
			);
		}
		textMesh.geometry.computeBoundingBox();

		var oldTextGeometry = textMesh.geometry.clone();
		var newTextGeometry = createFontGeometry( text );

		oldTextGeometry.computeBoundingBox();
		newTextGeometry.computeBoundingBox();

		var oldWidth = oldTextGeometry.boundingBox.max.x -  oldTextGeometry.boundingBox.min.x;
		var newWidth = newTextGeometry.boundingBox.max.x -  oldTextGeometry.boundingBox.min.x;
		var newHeight = newTextGeometry.boundingBox.max.y -  oldTextGeometry.boundingBox.min.y;
		console.log(newHeight);
	
		var crash = false;

		var position = new THREE.Vector3( oldWidth ,0 ,0 );
		
		do{
			var originPoint = position.clone().add(new THREE.Vector3( newWidth/2 , newHeight/2, 0 ));

			for (var vertexIndex = 0; vertexIndex < newTextGeometry.vertices.length; vertexIndex++) {
				if( newTextGeometry.vertices[vertexIndex].z != originPoint.z||newTextGeometry.vertices[vertexIndex].x >= newWidth/2 )
					continue;

			    var localVertex = newTextGeometry.vertices[vertexIndex].clone();

			    var directionVector = localVertex.sub( new THREE.Vector3( newWidth/2 ,newHeight/2,0 ) );
			    
			    var ray = new THREE.Raycaster(originPoint, directionVector.clone().normalize());

			    var collisionResults = ray.intersectObject( textMesh );

			    if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()) {
			        crash = true;  
			        oldTextGeometry.merge(newTextGeometry, new THREE.Matrix4().setPosition( position ));
			        break;
			    }
			}

			position.x -= 3;

		}while( !crash );

		return new THREE.Mesh( 
				oldTextGeometry,
				ringMatetial
			);

	}

	function ringBodyBuild( width, height, radius, cutAngle ){
		
		var curve = new THREE.EllipseCurve(
			0,  0,            // ax, aY
			430, 430,           // xRadius, yRadius
			0,  2 * Math.PI,  // aStartAngle, aEndAngle
			false,            // aClockwise
			0                 // aRotation 
		);


		// var randomPoints = [];
		// 		for ( var i = 0; i < 10; i ++ ) {
		// 			randomPoints.push( new THREE.Vector3( ( i - 4.5 ) * 500, THREE.Math.randFloat( - 500, 500 ), THREE.Math.randFloat( - 500, 500 ) ) );
		// 		}
		// 		var spline =  new THREE.CatmullRomCurve3( randomPoints );

		var points = [];
		for ( var i = 0; i <= 1; i +=0.01 ) {
			// points.push( new THREE.Vector3( curve.getPointAt( i ).x,0,curve.getPointAt( i ).y ) );
			// points.push( new THREE.Vector3( curve.getPointAt( i ).x, Math.sin( i*2*Math.PI )*100 ,curve.getPointAt( i ).y ) );
			// console.log(Math.sin(i*2*Math.PI)*100)
			points.push( new THREE.Vector3( curve.getPointAt( i ).x,Math.sin( i*2*Math.PI*6 )*30,curve.getPointAt( i ).y ) );

		}
		console.log(points);
		var spline =  new THREE.CatmullRomCurve3( points );
		spline.closed = true;
		//
		var extrudeSettings = {
			extrudePath		: spline,
			steps : 300,
		};
		var shape = new THREE.Shape();

		( function roundedRect( ctx, x, y, width, height, radius ){

			ctx.moveTo( x, y + radius );
			ctx.lineTo( x, y + width - radius );
			ctx.quadraticCurveTo( x, y + width, x + radius, y + width );
			ctx.lineTo( x + height - radius, y + width) ;
			ctx.quadraticCurveTo( x + height, y + width, x + height, y + width - radius );
			ctx.lineTo( x + height, y + radius );
			ctx.quadraticCurveTo( x + height, y, x + height - radius, y );
			ctx.lineTo( x + radius, y );
			ctx.quadraticCurveTo( x, y, x, y + radius );

		} )( shape, 0, 0, 100, width, 10 );


		var geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );
		var mesh = new THREE.Mesh( geometry, ringMatetial );

		return mesh;
	}


	
	function onWindowResize() {

		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize( window.innerWidth, window.innerHeight );

	}

	function animate() {

			requestAnimationFrame(animate);
			render();

	}

	function render() {

			stats.update();
			controls.update();
			renderer.render(scene, camera);

	}

	function AddCamera( X, Y, Z ) {

			camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
			camera.position.set( X, Y, Z );

			controls = new THREE.TrackballControls( camera );
			controls.rotateSpeed = 2;
			controls.noZoom = false;
			controls.zoomSpeed = 1.2;
			controls.staticMoving = true;

	}

	return {
		build : function ( text ){
			if(text.length > 7 ){
				alert('文字太长');
				return;
			}

			start( text );

		}
	}

}();
