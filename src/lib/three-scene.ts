// Three.js scene manager for packaging visualizations
import * as THREE from 'three'

export class ThreeSceneManager {
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private renderer: THREE.WebGLRenderer
  private container: HTMLElement

  constructor(containerId: string) {
    const container = document.getElementById(containerId)
    if (!container) {
      throw new Error(`Container with id '${containerId}' not found`)
    }
    this.container = container

    // Initialize Three.js components
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    
    this.setupScene()
    this.setupLighting()
    this.setupCamera()
    
    // Add renderer to DOM
    this.container.appendChild(this.renderer.domElement)
    
    // Handle resize
    this.handleResize()
    window.addEventListener('resize', () => this.handleResize())
  }

  private setupScene(): void {
    this.scene.background = null // Transparent background
  }

  private setupLighting(): void {
    // Ambient light for overall illumination
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6)
    this.scene.add(ambientLight)

    // Directional light for shadows and depth
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(5, 10, 5)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    this.scene.add(directionalLight)

    // Fill light from opposite side
    const fillLight = new THREE.DirectionalLight(0x4169e1, 0.3)
    fillLight.position.set(-5, 5, -5)
    this.scene.add(fillLight)
  }

  private setupCamera(): void {
    this.camera.position.set(0, 8, 12)
    this.camera.lookAt(0, 0, 0)
  }

  private handleResize(): void {
    const rect = this.container.getBoundingClientRect()
    const width = rect.width
    const height = Math.min(rect.height, 400) // Max height for packaging view
    
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  }

  public render(): void {
    this.renderer.render(this.scene, this.camera)
  }

  public clearScene(): void {
    // Remove all mesh objects but keep lights and camera
    const objectsToRemove: THREE.Object3D[] = []
    this.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        objectsToRemove.push(child)
      }
    })
    
    objectsToRemove.forEach(obj => {
      this.scene.remove(obj)
      // Dispose geometry and materials
      if (obj instanceof THREE.Mesh) {
        obj.geometry?.dispose()
        if (Array.isArray(obj.material)) {
          obj.material.forEach(mat => mat?.dispose())
        } else {
          obj.material?.dispose()
        }
      }
    })
  }

  public getScene(): THREE.Scene {
    return this.scene
  }

  public getCamera(): THREE.PerspectiveCamera {
    return this.camera
  }

  public destroy(): void {
    this.clearScene()
    this.renderer.dispose()
    if (this.container.contains(this.renderer.domElement)) {
      this.container.removeChild(this.renderer.domElement)
    }
    window.removeEventListener('resize', () => this.handleResize())
  }
}