var Ring = new function() {

	var startTime = new Date().getTime();				//用来计算各部分代码所花费的时间

	if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

	var container, stats;

	var camera, controls, scene, renderer;

	var ringObject = new THREE.Object3D();
	var ringText;
	var ringShape;
	var ringBody;
	var ringMaterial;


	// 各种资源的位置
	var baseUrl = {
		font : 'fonts/',
		model : 'models/',
		shape : 'models/'
	};

	// 全局设置
	var ringOptions = {
		text : 'hello',
		depth : 70,
		height : 0,
		type : 'text',
		textHeight : 158,
		shapeUrl : '',
		modelUrl : '',
		fontUrl : '',
		materialName : 'gold_yellow',
		fontName : '',
		positionCalibrated : new THREE.Vector3( 0, 0, 0 ),
		rotationCalibrated : new THREE.Euler( 0, 0, 0 ),
		cutFlag : true
	};

	// 缓存数据，减少改变参数时的重复加载
	var ringData = {
		font : null,
		shapeGeometry : null,
		ringGeometry : null
	}

	// 材质
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

	function start( text, materialName, ringModel, fontName, domId ){

		var id = domId ? domId : 'container' ;

		container = document.createElement('div');

		container.id = id;

		document.body.appendChild( container );

		init();
		animate();
		
		initOption( text, materialName, ringModel, fontName );

		loadResource( startBuild );

	}

	function getUrl( type, name ){

		switch( type ){

			case 'models' : 
				return baseUrl.model + name + '.js';
			case 'font' :
				return baseUrl.font + name + '.json';
			case 'shape' :
				return baseUrl.shape + name.substring( 1, name.length - 1 ) +'.js';

		}

		return null;
	}


	// 初始化ringOption
	function initOption( text, materialName, ringModel, fontName ){

		ringMaterial = getMaterialByName( materialName );

		ringOptions.materialName = materialName;

		ringOptions.fontName = fontName;

		ringOptions.text = text;

		ringOptions.modelUrl = getUrl( 'models', ringModel );

		if( isShape( text ) ){
			ringOptions.type = 'shape';
			ringOptions.shapeUrl = getUrl( 'shape', text );
			ringOptions.fontUrl = getUrl( 'font', fontName );
		} else {
			ringOptions.type = 'text';
			ringOptions.fontUrl = getUrl( 'font', fontName );
		}

		if( ringModel == '9-1' ){

			if( ringOptions.type == 'text' ){
				ringOptions.rotationCalibrated.set( 0, 0, 0 );
				ringOptions.positionCalibrated.set( 0, 0, 0 );
				ringOptions.cutFlag = true;
			}

		} else if( ringModel == '9-2' ){

			if( ringOptions.type == 'text' ){
				ringOptions.rotationCalibrated.set( 0, 0, 0 );
				ringOptions.positionCalibrated.set( 0, 0, 0 );
				ringOptions.cutFlag = true;
			} else if ( ringOptions.type == 'shape' ){
				ringOptions.rotationCalibrated.set( 0, 0, 0 );
				ringOptions.positionCalibrated.set( 0, 0, -20 );
			}

			ringOptions.cutFlag = true;

		} else if( ringModel == '9-3' ){

			if( ringOptions.type == 'text' ){
				ringOptions.textHeight = 150;
				ringOptions.rotationCalibrated.set( 0, 0, 6/180*Math.PI );
				ringOptions.positionCalibrated.set( 0, 37, 0 );
				ringOptions.cutFlag = false;
			}

		} else if( ringModel == '9-4' ){

			if( ringOptions.type == 'text' ){
				ringOptions.rotationCalibrated.set( 0, 0, 0 );
				ringOptions.positionCalibrated.set( -5, 0, -20 );
				ringOptions.cutFlag = true;
			}

		} else if( ringModel == '9-5' ){

			if( ringOptions.type == 'text' ){
				ringOptions.rotationCalibrated.set( 0, 0, 0 );
				ringOptions.positionCalibrated.set( 0, 0, 0 );
				ringOptions.cutFlag = true;
				ringOptions.depth = 50;
			}

		} else {
			ringOptions.rotationCalibrated.set( 0, 0, 0 );
			ringOptions.positionCalibrated.set( 0, 0, 0 );
			ringOptions.cutFlag = true;
		}

	}

	// 改变戒指参数
	function changeRing( type, value ){

		if( type == 'text' ){

			ringObject.remove( ringBody );
			ringObject.remove( ringText );
			scene.remove( ringObject );
			ringObject = new THREE.Object3D();

			ringOptions.text = value;
			if( isShape(ringOptions.text) ){
				ringOptions.type = 'shape';
				ringOptions.shapeUrl = getUrl( 'shape', ringOptions.text );

				if( ringData.shapeGeometry == null){
					loadJSON( ringOptions.shapeUrl, startBuild );
				}

			} else {
				ringOptions.type = 'text';
				startBuild();
			}

		} else if ( type == "height" ){
			console.log(value/ringOptions.height)
			ringObject.scale.y = value/ringOptions.height;

		} else if ( type == "material" ){

			var material = getMaterialByName( value );
			for(var i = 0;i<ringObject.children.length;i++){
				ringObject.children[i].material = material;
			}


		} else if ( type == 'model' ){

			initOption( ringOptions.text,ringOptions.materialName,value,ringOptions.fontName );

			ringObject.remove( ringBody );
			ringObject.remove( ringText );
			scene.remove( ringObject );
			ringObject = new THREE.Object3D();
			ringOptions.modelUrl = 'models/' + value + '.js';
			var JSONLoader = new THREE.JSONLoader();
			JSONLoader.load( ringOptions.modelUrl, function ( geometry, materials ) {
				ringData.ringGeometry = geometry.clone();

				startBuild( geometry );

			});
		}

	}

	function getOption( type ){
		
		switch( type ){
			case 'text' : 
				return ringOptions.text;
			case 'height' : 
				return ringOptions.height;
		}
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

	function loadResource ( callback ){

		var font;

		var FontLoader = new THREE.FontLoader();
		var JSONLoader = new THREE.JSONLoader();

		function loadRing( ){

			FontLoader.load( ringOptions.fontUrl, function ( response ) {
				font = response;
				ringData.font = font;

				JSONLoader.load( ringOptions.modelUrl, function ( geometry, materials ) {
					ringData.ringGeometry = geometry.clone();
					callback();
				});

			} );
		}

		if ( ringOptions.type == 'shape' ){



			JSONLoader.load( ringOptions.shapeUrl, function (  geometry, materials  ) {
				ringData.shapeGeometry = geometry;
				loadRing();
			} );

		} else if ( ringOptions.type == 'text' ){

			loadRing();

		}

	}

	function loadFont( callback ){

		var loader = new THREE.FontLoader();

		loader.load( ringOptions.fontUrl, function ( response ) {

			ringData.font = font;
			callback();

		} );

	}

	function loadJSON( url, callback ){

		var loader = new THREE.JSONLoader();

		var url;

		if( ringOptions.type == 'shape' ){

			url = ringOptions.shapeUrl;

		} else if (  ringOptions.type == 'text'  ){

			url = ringOptions.modelUrl;

		}

		loader.load( url, function ( geometry, materials ) {

			if( ringOptions.type == 'shape' ){

				ringData.shapeGeometry = geometry;

			} else if (  ringOptions.type == 'text'  ){

				ringData.ringGeometry = geometry;

			}

			callback();
		});
	}


	function startBuild(){

		console.log( 'load ' + (new Date().getTime() - startTime) +'ms' );

		if( ringOptions.type == 'shape' ){

			ringText = shapeMeshBuild();

		} else if( ringOptions.type == 'text' ) {

			ringText = textMeshBuild( ringOptions.text, ringData.font );

		}

		ringBody = buildRing( );

	}

	function init() {

		// camera

		camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
		camera.position.set( 0, 0, 2000 );

		controls = new THREE.OrbitControls( camera, container );
		controls.enableDamping = true;
		controls.dampingFactor = 0.15;
		controls.minDistance = 1000;
		controls.maxDistance = 2200;
		controls.rotateSpeed = 0.15;


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
		container.appendChild( renderer.domElement );

		stats = new Stats();
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.top = '0px';
		stats.domElement.style.zIndex = 100;
		container.appendChild( stats.domElement );

	
		window.addEventListener( 'resize', onWindowResize, false );

	}

	function buildRing( ){

		var geometry = ringData.ringGeometry.clone();

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

		origin.set( radius + geometry.boundingBox.min.x , 0, radius + geometry.boundingBox.min.z);

		ringOptions.height = geometry.boundingBox.max.y - geometry.boundingBox.min.y;

		var theta = (ringText.width/2-7)/(radius+ringText.depth/2);

		var normal1 = new THREE.Vector3().crossVectors( 
											new THREE.Vector3(0,0,1).applyAxisAngle(new THREE.Vector3(0,1,0), theta).normalize(), 
											new THREE.Vector3(0,1,1).applyAxisAngle(new THREE.Vector3(0,1,0), theta).normalize()
										);

		var normal2 = new THREE.Vector3().crossVectors( 
											new THREE.Vector3(0,0,1).applyAxisAngle(new THREE.Vector3(0,1,0), -theta).normalize(), 
											new THREE.Vector3(0,1,1).applyAxisAngle(new THREE.Vector3(0,1,0), -theta).normalize()
										);
	
		var plane1 = new THREE.Plane();
		plane1.setFromNormalAndCoplanarPoint( normal1.normalize(), origin);

		var plane2 = new THREE.Plane();
		plane2.setFromNormalAndCoplanarPoint( normal2.normalize().negate(), origin);

		function inRange( p1, p2, point ){
			if( ringOptions.cutFlag && p1.distanceToPoint( point ) > 0 && p2.distanceToPoint( point ) > 0 )
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

				var vec = getInnerPoint( newVertices[newVertices.length-1].clone(), origin, radius-20 ).sub( point1.clone() );

				newFaces.push( createUniformFace( newVertices, newVertices.length-1, newVertices.length-2, newVertices.length-3, vec ) );
				newFaces.push( createUniformFace( newVertices, newVertices.length-2, newVertices.length-3, newVertices.length-4, vec ) );
		
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

				var vec = getInnerPoint( newVertices[newVertices.length-1].clone(), origin, radius-20 ).sub( point1.clone() );

				newFaces.push( createUniformFace( newVertices, newVertices.length-1, newVertices.length-2, newVertices.length-3, vec ) );

				intersectFlag1 == 1 ? endPointsIndex1.push( newVertices.length-2 ) : endPointsIndex2.push( newVertices.length-2 );
				intersectFlag2 == 1 ? endPointsIndex1.push( newVertices.length-1 ) : endPointsIndex2.push( newVertices.length-1 );

			}
		}

	
		var newGeometry = new THREE.Geometry();
		newGeometry.vertices = newVertices;
		newGeometry.faces = newFaces;

		var planVertices = [];
		var planFaces = [];
		var planeGeo = new THREE.Geometry();

		if( ringOptions.cutFlag && endPointsIndex1.length > 0 && endPointsIndex2.length > 0 ){
			planVertices.push( newVertices[endPointsIndex1[0]], newVertices[endPointsIndex2[0]] );
		}

		var vec = new THREE.Vector3( 0,0,-1 );
		for(var i=2;i<endPointsIndex1.length;i++){

			planVertices.push( newVertices[ endPointsIndex1[i-1] ], newVertices[ endPointsIndex1[i] ] );
			planFaces.push( createUniformFace( planVertices, 0,planVertices.length-1,planVertices.length-2,vec ) );
			
		}


		for(var i=2;i<endPointsIndex2.length;i++){
			planVertices.push( newVertices[ endPointsIndex2[i-1] ], newVertices[ endPointsIndex2[i] ] );
			planFaces.push( createUniformFace( planVertices, 1,planVertices.length-1,planVertices.length-2,vec ) );

		}

		planeGeo.vertices = planVertices;
		planeGeo.faces = planFaces;
		planeGeo.mergeVertices();
		planeGeo.computeFaceNormals();
		planeGeo.computeVertexNormals();

		newGeometry.mergeVertices();
		newGeometry.computeFaceNormals();
		newGeometry.computeVertexNormals();

		newGeometry.merge( planeGeo );

		ringBody = new THREE.Mesh( newGeometry,ringMaterial );

		scene.add(ringBody);
		ringObject.add( ringBody );
		ringText =  bend( origin, radius, ringText );
		ringText.position.copy( ringOptions.positionCalibrated );
		ringText.position.y -= ringOptions.textHeight/2;
		ringText.rotation.copy( ringOptions.rotationCalibrated );
		ringObject.add( ringText );

		// edges = new THREE.EdgesHelper( ringText, 0x00ff00 );
		// scene.add( edges );

		scene.add(ringObject);

		console.log( 'total ' + (new Date().getTime() - startTime) +'ms' );

	}

	function createUniformFace( vertices, a, b, c, vec ){

		var normal = computeNormal( vertices[a].clone(), vertices[b].clone(), vertices[c].clone() );

		if( vec.angleTo( normal ) <= Math.PI/2 ){
			return new THREE.Face3( a, b, c );
		} 

		return new THREE.Face3( c, b, a );

	}

	function computeNormal( va, vb, vc ){

		var cb = new THREE.Vector3(), ab = new THREE.Vector3();

		cb.subVectors( vc, vb );
		ab.subVectors( va, vb );
		cb.cross( ab );

		return cb.normalize();

	}

	function getInnerPoint( point, origin, radius ){

		var dir = point.sub( origin.clone().setY( point.y ) );

		return dir.setLength ( radius );

	}

	function isShape( text ){
		var pattern =  /\[\S+\]/g;
		return pattern.test( text );
	}

	function isSpecial( c ){
		if( c>='A' && c<='Z' || c=='p' || c=='s' || c=='1')
			return true;
		return false;
	}

	function shapeMeshBuild(){

		var geometry = ringData.shapeGeometry.clone();

		var mesh = new THREE.Mesh( geometry, ringMaterial );
		mesh.geometry.applyMatrix( new THREE.Matrix4().makeScale( 50, 50, 50 ) );
		mesh.geometry.computeBoundingBox();
		mesh.width = mesh.geometry.boundingBox.max.x -  mesh.geometry.boundingBox.min.x;
		mesh.height = mesh.geometry.boundingBox.max.y - mesh.geometry.boundingBox.min.y;
		mesh.depth = mesh.geometry.boundingBox.max.z - mesh.geometry.boundingBox.min.z;

		mesh.geometry.applyMatrix( new THREE.Matrix4().setPosition( new THREE.Vector3( mesh.width/2, mesh.height/2, mesh.depth/2 ) ) );

		return mesh;
	}

	function textMeshBuild( text, textFont ){

		var text = ringOptions.text;

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

		textMesh.geometry.computeBoundingBox();

		textMesh.width = textMesh.geometry.boundingBox.max.x -  textMesh.geometry.boundingBox.min.x;
		textMesh.height = textMesh.geometry.boundingBox.max.y - textMesh.geometry.boundingBox.min.y;
		textMesh.depth = textMesh.geometry.boundingBox.max.z - textMesh.geometry.boundingBox.min.z;

		return textMesh;
		
	}

	function createFontGeometry( text ) {

		return new THREE.TextGeometry( text,{
						size: ringOptions.textHeight,
						height: ringOptions.depth,
						curveSegments: 4,
						font: ringData.font,
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

	function exportModel( type ){

		var data;

		type = type.toLowerCase();
		
		window.URL = window.URL || window.webkitURL;
		window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;

		if( type == 'obj' ){

			var exporter = new THREE.OBJExporter();
			data = exporter.parse( scene );

		} else if ( type == 'stl' ){

			var exporter = new THREE.STLExporter();
			data = exporter.parse( scene );

		}

		var link = document.createElement( 'a' );
		link.style.display = 'none';
		document.body.appendChild( link );
		link.href = URL.createObjectURL(  new Blob( [ data ], { type: 'text/plain' } ) );
		link.download = 'model.' + type;
		link.click();

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


		init : function ( text, materialName, ringModel, fontName, domId){

			if(text.length > 13 ){
				alert('文字太长');
				return;
			}

			start( text, materialName, ringModel, fontName, domId );

		},

		change : function( type, value ){
			changeRing( type, value );
		},

		get : function( type ){
			return getOption( type );
		},

		export : function( type ){
			exportModel( type );
		}

	}

}();
