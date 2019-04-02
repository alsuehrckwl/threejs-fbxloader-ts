import React, { Component } from 'react'
import { Button } from '@material-ui/core'
import Unity from '../../components/Unity/Unity'
import autobind from 'autobind-decorator'
import * as THREE from 'three'
// import { OrbitControls } from '@kibou/three-orbitcontrols-ts'
// import FBXLoader from 'threejs-fbxloader'
// import FBXLoader from '../../FBXLoader'
import * as OrbitControls from 'three-orbitcontrols'
// import FBXLoader from 'three-fbx-loader'
import FBXLoader from './FBXLoader'
import { SSL_OP_NETSCAPE_REUSE_CIPHER_CHANGE_BUG } from 'constants'

interface State {
  isUnityOpen: boolean
  container: any
  camera: any
  controls: any
  scene: any
  renderer: any
}

@autobind
class UnityContainer extends Component<{}, State> {
  private threeEl = React.createRef<HTMLDivElement>()
  private THREE = THREE
  private mixer: any

  constructor(props) {
    super(props)

    this.state = {
      isUnityOpen: false,
      container: null,
      camera: null,
      controls: null,
      scene: null,
      renderer: null
    }
  }

  openUnity() {
    this.setState({
      isUnityOpen: true
    })
  }

  closeUnity() {
    this.setState({
      isUnityOpen: false
    })
  }

  initThree() {
    const { container } = this.state

    const trCamera = this.setCamera()
    const trScene = this.setScene()

    this.setHemiLight(trScene)
    this.setDirectLight(trScene)
    this.setMesh(trScene)
    this.setGrid(trScene)
    this.setFBX(trScene)

    const trRenderer: any = this.setRenderer()
    const trContainer: any = this.threeEl
    const trOrbitControls = this.setControls(trCamera, trRenderer)

    trContainer.current.appendChild(trRenderer.domElement)

    window.addEventListener('resize', onWindowResize, false)

    function onWindowResize() {
      trCamera.aspect = window.innerWidth / window.innerHeight
      trCamera.updateProjectionMatrix()
      trRenderer.setSize(window.innerWidth, window.innerHeight)
    }

    this.setState({
      container: this.threeEl,
      camera: trCamera,
      controls: trOrbitControls,
      scene: trScene,
      renderer: trRenderer
    })
  }

  componentDidMount() {
    this.initThree()
  }

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    if (this.state.renderer !== nextState.renderer) {
      this.animate()
      nextState.renderer.render(nextState.scene, nextState.camera)
    }
    return false
  }

  animate() {
    requestAnimationFrame(this.animate)
    const clock = new THREE.Clock()
    const delta = clock.getDelta()

    if (this.mixer) {
      this.mixer.update(delta)
    }

    if (this.state.renderer) {
      this.state.renderer.render(this.state.scene, this.state.camera)
    }
    // stats.update()
  }

  /**
   * @description
   */
  setCamera() {
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      1,
      2000
    )

    camera.position.set(100, 200, 300)

    return camera
  }

  /**
   * @description
   */
  setControls(camera, renderer) {
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.target.set(0, 10, 0)
    controls.update()

    return controls
  }

  /**
   * @description
   */
  setScene() {
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xa0a0a0)
    scene.fog = new THREE.Fog(0xa0a0a0, 200, 1000)

    return scene
  }

  /**
   * @description
   */
  setHemiLight(scene) {
    const light = new THREE.HemisphereLight(0xffffff, 0x444444)
    light.position.set(0, 200, 0)
    scene.add(light)
  }

  /**
   * @description
   */
  setDirectLight(scene) {
    const light = new THREE.DirectionalLight(0xffffff)
    light.position.set(0, 200, 100)
    light.castShadow = true
    light.shadow.camera.top = 180
    light.shadow.camera.bottom = -100
    light.shadow.camera.left = -120
    light.shadow.camera.right = 120
    scene.add(light)
  }

  /**
   * @description
   */
  setMesh(scene) {
    const mesh = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(2000, 2000),
      new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false })
    )
    mesh.rotation.x = -Math.PI / 2
    mesh.receiveShadow = true
    scene.add(mesh)
  }

  /**
   * @description
   */
  setGrid(scene) {
    const grid = new THREE.GridHelper(2000, 20, 0x000000, 0x000000)
    grid.material['opacity'] = 0.2
    grid.material['transparent'] = true
    scene.add(grid)
  }

  /**
   * @description
   */
  setFBX(scene) {
    const loader = new FBXLoader()
    loader.load(
      'https://storage.googleapis.com/avatar_store/test/1the_Girl_02_idle.FBX',
      object => {
        console.log('object = ', object)
        const mixer = new THREE.AnimationMixer(object)
        const action = mixer.clipAction(object.animations[0])
        action.play()
        object.traverse(child => {
          if (child.isMesh) {
            child.castShadow = true
            child.receiveShadow = true
          }
        })
        scene.add(object)
      }
    )
  }

  setRenderer() {
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.shadowMap.enabled = true
    return renderer
  }

  render() {
    const { isUnityOpen } = this.state
    return (
      <div>
        <Button onClick={this.openUnity}>미리보기</Button>
        <Button onClick={this.closeUnity}>미리보기 닫기dfg</Button>
        <div ref={this.threeEl} />
      </div>
    )
  }
}

export default UnityContainer
