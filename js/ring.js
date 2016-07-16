var Ring = new function() {

	var startTime = new Date().getTime();
	if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

	var container, stats;

	var camera, controls, scene, renderer;

	var ringText;
	var ringBody;
	var ringMesh;
	var ringMaterial;

	var ringOption = {
		text : 'hello',
		depth : 70,
		textHeight : 158,
		modelUrl : '',
		fontUrl : ''
	};

	var ringMaterials = [];

	var urls = [ "img/px.jpg", "img/nx.jpg", 
				"img/py.jpg", "img/ny.jpg", 
				"img/pz.jpg", "img/nz.jpg"];

	var cube = THREE.ImageUtils.loadTextureCube(urls);
	cube.format = THREE.RGBFormat;

	ringMaterials.push( makeMaterial({
									color: 0xffce42, 
									specular : 0x333333, 
									combine : THREE.MixOperation, 
									envMap : cube,
									shininess : 54, 
									reflectivity: 0.75 ,
									side:THREE.DoubleSide, 
									shading: THREE.SmoothShading
							},'gold_yellow') );

	ringMaterials.push( makeMaterial({
									color: 0xff9993, 
									specular : 0x333333, 
									combine : THREE.MixOperation, 
									envMap : cube,
									shininess : 54, 
									reflectivity: 0.75 ,
									side:THREE.DoubleSide, 
									shading: THREE.SmoothShading
							},'gold_red') );

	ringMaterials.push( makeMaterial({
									color: 0xffffff, 
									specular : 0xffffff, 
									combine : THREE.MixOperation, 
									envMap : cube,
									shininess : 54, 
									reflectivity: 0.75 ,
									side:THREE.DoubleSide, 
									shading: THREE.SmoothShading
							},'silver') );


	init();
	animate();

	function start( text ){
		
		initOption( text, 
					'gold_yellow',
					'9-4',
					'Script_MT_Bold_Regular' );

		loadResource( ringOption.text, ringOption.fontUrl, ringOption.modelUrl, startBuild );

	}

	function initOption( text, materialName, ringModel, fontName ){

		ringMaterial = getMaterialByName( materialName );

		ringOption.text = text;

		ringOption.modelUrl = 'models/' + ringModel + '.js';

		ringOption.fontUrl = 'fonts/' + fontName + '.json';

	}

	function makeMaterial( options, name ){
		var material = new THREE.MeshPhongMaterial( options );
		material.name = name;
		return material;
	}

	function getMaterialByName( name ){
		for(var i=0; i<ringMaterials.length;i++){
			if( ringMaterials[i].name == name ){
				return ringMaterials[i];
			}
		}
		return ringMaterials[0];
	};

	function loadResource ( text, fontUrl, modelUrl, callback ){

		var font;

		var FontLoader = new THREE.FontLoader();
		var JSONLoader = new THREE.JSONLoader();

		FontLoader.load( fontUrl, function ( response ) {
			font = response;
			JSONLoader.load( modelUrl, function ( geometry, materials ) {
				callback( text, font, geometry );
			});
		} );

	}

	function startBuild( text, textFont, ringGeometry ){
		ringText = textMeshBuild( text, textFont );
		ringBody = buildRing( ringGeometry );
	}

	function init() {

		// camera

		camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
		camera.position.set( 0, 0, 2000 );

		controls = new THREE.TrackballControls( camera, container );
		controls.rotateSpeed = 2;
		controls.noZoom = false;
		controls.zoomSpeed = 1.2;
		controls.staticMoving = true;

		scene = new THREE.Scene();

		// lights

		light = new THREE.DirectionalLight( 0xffffe6,0.95 );
		light.position.set( 0, 100, 200 );
		scene.add( light );

		light = new THREE.DirectionalLight( 0xffffe6,0.75 );
		light.position.set( 0, -100, -200 );
		scene.add( light );

		var light = new THREE.HemisphereLight( 0xcbf1fe, 0xfff2d6, 0.4 );
		scene.add( light );

		var light = new THREE.AmbientLight( 0x404040 ); 
		scene.add( light );


		// renderer

		renderer = new THREE.WebGLRenderer( { antialias: true } );
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setClearColor( 0xffffff );
		renderer.setSize( window.innerWidth, window.innerHeight );

		container = document.getElementById( 'container' );
		container.appendChild( renderer.domElement );

		stats = new Stats();
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.top = '0px';
		stats.domElement.style.zIndex = 100;
		container.appendChild( stats.domElement );

	
		window.addEventListener( 'resize', onWindowResize, false );

	}

	function buildRing( geometry ){

		var radius;
		var origin = new THREE.Vector3();
		var newVertices = [];
		var newFaces = [];
		var endPointsIndex1 = [];
		var endPointsIndex2 = [];

		var matrix = (new THREE.Matrix4().makeRotationX ( - Math.PI/2 )).multiply(new THREE.Matrix4().makeScale ( 50, 50, 50 ));

		geometry.applyMatrix(matrix);
		geometry.verticesNeedUpdate = true;
		geometry.computeBoundingBox();

		radius = (geometry.boundingBox.max.x - geometry.boundingBox.min.x)/2;

		origin.set( 0, 0, radius + geometry.boundingBox.min.z);

		var theta = (ringText.width/2-7)/(radius+ringText.depth/2);

		var normal1 = new THREE.Vector3().crossVectors( 
											new THREE.Vector3(0,0,1).applyAxisAngle(new THREE.Vector3(0,1,0),theta).normalize(), 
											new THREE.Vector3(0,1,1).applyAxisAngle(new THREE.Vector3(0,1,0),theta).normalize()
										);

		var normal2 = new THREE.Vector3().crossVectors( 
											new THREE.Vector3(0,0,1).applyAxisAngle(new THREE.Vector3(0,1,0),-theta).normalize(), 
											new THREE.Vector3(0,1,1).applyAxisAngle(new THREE.Vector3(0,1,0),-theta).normalize()
										);
	
		var plane1 = new THREE.Plane();
		plane1.setFromNormalAndCoplanarPoint( normal1.normalize(), origin);

		var plane2 = new THREE.Plane();
		plane2.setFromNormalAndCoplanarPoint( normal2.normalize().negate(), origin);

		function inRange( p1, p2, point ){
			if( p1.distanceToPoint( point ) > 0 && p2.distanceToPoint( point ) > 0 )
				return true;
			return false;
		}


		for(var i=0;i<geometry.faces.length;i++){

			var face = geometry.faces[i];

			var a = geometry.vertices[ face.a ];
			var b = geometry.vertices[ face.b ];
			var c = geometry.vertices[ face.c ];

			var points = [ a, b, c ];
			var outPointsFlag = [ 0, 0, 0 ];
			var inPoints = [];
			var outPoints = [];

			if( inRange( plane1, plane2, a ) ){
				outPointsFlag[0] = 1;
			}

			if( inRange( plane1, plane2, b ) ){
				outPointsFlag[1] = 1;
			}

			if( inRange( plane1, plane2, c ) ){
				outPointsFlag[2] = 1;
			}

			for(var k=0;k<outPointsFlag.length;k++){
				if( outPointsFlag[k] ){
					outPoints.push( points[k] );
				}else{
					inPoints.push( points[k] );
				}
			}


			if( outPoints.length == 0 ){

				newVertices.push( a, b, c );
				newFaces.push( new THREE.Face3( newVertices.length-1, newVertices.length-2, newVertices.length-3 ) );

			}else if( outPoints.length == 1 ){

				var line1 = new THREE.Line3( outPoints[0], inPoints[0] );
				var line2 = new THREE.Line3( outPoints[0], inPoints[1] );

				var intersectFlag1 = 1,intersectFlag2 = 1;

				var point1, point2;

				if ( ( point1 = plane1.intersectLine( line1 ) ) != undefined ){
					intersectFlag1 = 1;
				} else {
					point1 = plane2.intersectLine( line1 );
					intersectFlag1 = 2;
				}

				if ( ( point2 = plane1.intersectLine( line2 ) ) != undefined ){
					intersectFlag2 = 1;
				} else {
					point2 = plane2.intersectLine( line2 );
					intersectFlag2 = 2;
				}


				newVertices.push( inPoints[0], inPoints[1], point1, point2 );
				newFaces.push( new THREE.Face3( newVertices.length-1, newVertices.length-3, newVertices.length-4 ) );
				newFaces.push( new THREE.Face3( newVertices.length-2, newVertices.length-3, newVertices.length-4 ) );
				newFaces.push( new THREE.Face3( newVertices.length-1, newVertices.length-2, newVertices.length-4 ) );

				intersectFlag1 == 1 ? endPointsIndex1.push( newVertices.length-2 ) : endPointsIndex2.push( newVertices.length-2 );
				intersectFlag2 == 1 ? endPointsIndex1.push( newVertices.length-1 ) : endPointsIndex2.push( newVertices.length-1 );

			}else if( outPoints.length == 2 ){

				var line1 = new THREE.Line3( inPoints[0], outPoints[0] );
				var line2 = new THREE.Line3( inPoints[0], outPoints[1] );

				var intersectFlag1 = 1,intersectFlag2 = 1;

				var point1, point2;

				if ( ( point1 = plane1.intersectLine( line1 ) ) != undefined ){
					intersectFlag1 = 1;
				} else {
					point1 = plane2.intersectLine( line1 );
					intersectFlag1 = 2;
				}

				if ( ( point2 = plane1.intersectLine( line2 ) ) != undefined ){
					intersectFlag2 = 1;
				} else {
					point2 = plane2.intersectLine( line2 );
					intersectFlag2 = 2;
				}

				newVertices.push( inPoints[0], point1, point2 );
				newFaces.push( new THREE.Face3( newVertices.length-1, newVertices.length-2, newVertices.length-3 ) );

				intersectFlag1 == 1 ? endPointsIndex1.push( newVertices.length-2 ) : endPointsIndex2.push( newVertices.length-2 );
				intersectFlag2 == 1 ? endPointsIndex1.push( newVertices.length-1 ) : endPointsIndex2.push( newVertices.length-1 );

			}
		}

		for(var i=2;i<endPointsIndex1.length;i++){
			newFaces.push( new THREE.Face3( endPointsIndex1[0],endPointsIndex1[i],endPointsIndex1[i-1] ) );
		}

		for(var i=2;i<endPointsIndex2.length;i++){
			newFaces.push( new THREE.Face3( endPointsIndex2[0],endPointsIndex2[i],endPointsIndex2[i-1] ) );
		}

	

		var newGeometry = new THREE.Geometry();
		newGeometry.vertices = newVertices;
		newGeometry.faces = newFaces;
		newGeometry.mergeVertices();
		newGeometry.computeFaceNormals();
        newGeometry.computeVertexNormals();

		ringBody = new THREE.Mesh( newGeometry,ringMaterial );
		scene.add(ringBody);
		ringText =  bend( origin, radius, ringText );
		ringText.position.y = -70;
		ringText.position.x += 5;
		scene.add( ringText );
	}

	function isSpecial( c ){
		if( c>='A' && c<='Z' || c=='p' || c=='s' || c=='1')
			return true;
		return false;
	}



	function textMeshBuild( text, textFont ){

		var textMesh;
		var start = 0;
		var flag = 0;

		for( var i = 0; i < text.length ; i++ ){
			if( isSpecial( text[i] )|| i == text.length-1 ){
				if( flag ){
					flag = 0;
					textMesh = textMeshPush( textMesh, text.substring( start, i ), textFont );
				}
				textMesh = textMeshPush( textMesh, text[i], textFont );
			}else{
				if( !flag ){
					flag = 1;
					start = i;
				}
			}
		}

		textMesh.geometry.computeBoundingBox();

		textMesh.width = textMesh.geometry.boundingBox.max.x -  textMesh.geometry.boundingBox.min.x;
		textMesh.height = textMesh.geometry.boundingBox.max.y - textMesh.geometry.boundingBox.min.y;
		textMesh.depth = textMesh.geometry.boundingBox.max.z - textMesh.geometry.boundingBox.min.z;

		return textMesh;
		
	}

	function createFontGeometry( text, textFont ) {

		return new THREE.TextGeometry( text,{
						size: ringOption.textHeight,
						height: ringOption.depth,
						curveSegments: 4,
						font: textFont,
						weight: "bold",
						style: "normal",
						bevelEnabled: true,
						bevelThickness: 2,
						bevelSize: 1,
					});
	}

	function textMeshPush( textMesh, text, textFont ){

		if( textMesh === undefined ){
			return new THREE.Mesh( 
				createFontGeometry( text, textFont ),
				ringMaterial
			);
		}
		textMesh.geometry.computeBoundingBox();

		var oldTextGeometry = textMesh.geometry.clone();
		var newTextGeometry = createFontGeometry( text, textFont );

		oldTextGeometry.computeBoundingBox();
		newTextGeometry.computeBoundingBox();

		var oldWidth = oldTextGeometry.boundingBox.max.x -  oldTextGeometry.boundingBox.min.x;
		var newWidth = newTextGeometry.boundingBox.max.x -  oldTextGeometry.boundingBox.min.x;
		var newHeight = newTextGeometry.boundingBox.max.y -  oldTextGeometry.boundingBox.min.y;
	
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
				ringMaterial
			);

	}

	function bend( origin, radius, mesh ){


		var matrix = new THREE.Matrix4().setPosition( new THREE.Vector3( -mesh.width/2, 0, 0 ) );
		mesh.geometry.applyMatrix( matrix );

		var outerRadius = radius + mesh.depth/2;
		var outerCircumference = outerRadius*2*Math.PI;

		for( var i=0; i<mesh.geometry.vertices.length; i++ ){
			var point = mesh.geometry.vertices[i];
			var pointRadius = radius - point.z;
			var pointX = point.x;
			var theta = pointX / outerCircumference*Math.PI*2;
			mesh.geometry.vertices[i].set( pointRadius*Math.sin(theta),point.y,pointRadius*Math.cos(theta) ).add( origin );
		}
		mesh.geometry.verticesNeedUpdate = true;
		mesh.geometry.mergeVertices();
		mesh.geometry.computeFaceNormals();
        mesh.geometry.computeVertexNormals();

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


	return {
		build : function ( text ){
			if(text.length > 13 ){
				alert('文字太长');
				return;
			}

			start( text );

		}
	}

}();
