// Packaging math visualization: batch → servings → parcels
import * as THREE from 'three'
import { ThreeSceneManager } from './three-scene'

interface CubeInfo {
  mesh: THREE.Mesh
  id: number
  originalPosition: THREE.Vector3
  group: 'batch' | 'serving' | 'parcel'
  groupIndex?: number
}

export class PackagingVisualizer {
  private sceneManager: ThreeSceneManager
  private cubes: CubeInfo[] = []
  private animationId: number | null = null

  // Materials
  private batchMaterial!: THREE.MeshLambertMaterial
  private servingMaterial!: THREE.MeshLambertMaterial
  private parcelMaterial!: THREE.MeshLambertMaterial
  private geometry!: THREE.BoxGeometry

  constructor(containerId: string) {
    this.sceneManager = new ThreeSceneManager(containerId)
    this.setupMaterials()
    this.startRenderLoop()
  }

  private setupMaterials(): void {
    this.geometry = new THREE.BoxGeometry(0.8, 0.8, 0.8)
    
    // Batch items (original baked goods)
    this.batchMaterial = new THREE.MeshLambertMaterial({
      color: 0xff6b35, // Orange for baked goods
      transparent: true,
      opacity: 0.9
    })

    // Individual servings (after division)
    this.servingMaterial = new THREE.MeshLambertMaterial({
      color: 0x4caf50, // Green for servings
      transparent: true,
      opacity: 0.9
    })

    // Packaged parcels (after combination)
    this.parcelMaterial = new THREE.MeshLambertMaterial({
      color: 0x007acc, // Blue for final packages
      transparent: true,
      opacity: 0.9
    })
  }

  /**
   * Show initial batch of baked goods
   * Example: 2 cookies from recipe
   */
  public showBatch(totalItems: number): void {
    this.clearVisualization()
    
    // Arrange items in a grid (1-2 rows max for simplicity)
    const itemsPerRow = Math.min(totalItems, 6)
    const rows = Math.ceil(totalItems / itemsPerRow)
    
    const spacing = 1.2
    const startX = -(itemsPerRow - 1) * spacing / 2
    const startZ = -(rows - 1) * spacing / 2

    for (let i = 0; i < totalItems; i++) {
      const row = Math.floor(i / itemsPerRow)
      const col = i % itemsPerRow
      
      const cube = new THREE.Mesh(this.geometry, this.batchMaterial.clone())
      cube.position.set(
        startX + col * spacing,
        0.4,
        startZ + row * spacing
      )
      cube.castShadow = true
      cube.receiveShadow = true
      
      // Start small and animate in
      cube.scale.setScalar(0)
      this.animateCubeIn(cube, i * 100)
      
      const cubeInfo: CubeInfo = {
        mesh: cube,
        id: i,
        originalPosition: cube.position.clone(),
        group: 'batch'
      }
      
      this.cubes.push(cubeInfo)
      this.sceneManager.getScene().add(cube)
    }
  }

  /**
   * Animate batch division into servings
   * Example: 2 cookies → 24 pieces (12 pieces per cookie)
   */
  public animateDivision(itemCount: number, piecesPerItem: number): Promise<void> {
    return new Promise((resolve) => {
      const totalPieces = itemCount * piecesPerItem
      
      // Calculate new grid layout for all pieces
      const piecesPerRow = Math.min(totalPieces, 8) // Max 8 pieces per row
      const rows = Math.ceil(totalPieces / piecesPerRow)
      
      const spacing = 0.6 // Smaller spacing for pieces
      const startX = -(piecesPerRow - 1) * spacing / 2
      const startZ = -(rows - 1) * spacing / 2
      
      // For each original item, create its pieces
      let pieceIndex = 0
      let animationsCompleted = 0
      const totalAnimations = totalPieces
      
      for (let itemIdx = 0; itemIdx < itemCount; itemIdx++) {
        const originalCube = this.cubes[itemIdx]
        
        // Create pieces for this item
        for (let pieceIdx = 0; pieceIdx < piecesPerItem; pieceIdx++) {
          const row = Math.floor(pieceIndex / piecesPerRow)
          const col = pieceIndex % piecesPerRow
          
          const piece = new THREE.Mesh(this.geometry, this.servingMaterial.clone())
          piece.position.copy(originalCube.originalPosition) // Start at original position
          piece.scale.setScalar(0.7) // Smaller for pieces
          
          const targetPosition = new THREE.Vector3(
            startX + col * spacing,
            0.3,
            startZ + row * spacing
          )
          
          const cubeInfo: CubeInfo = {
            mesh: piece,
            id: pieceIndex,
            originalPosition: targetPosition.clone(),
            group: 'serving',
            groupIndex: itemIdx
          }
          
          this.cubes.push(cubeInfo)
          this.sceneManager.getScene().add(piece)
          
          // Animate to new position
          this.animateMovement(
            piece,
            targetPosition,
            800,
            pieceIdx * 50,
            () => {
              animationsCompleted++
              if (animationsCompleted === totalAnimations) {
                // Hide original batch items
                for (let i = 0; i < itemCount; i++) {
                  this.cubes[i].mesh.visible = false
                }
                resolve()
              }
            }
          )
          
          pieceIndex++
        }
      }
    })
  }

  /**
   * Animate grouping pieces into parcels
   * Example: 24 pieces → 6 parcels (4 pieces per parcel)
   */
  public animatePackaging(totalPieces: number, piecesPerParcel: number): Promise<void> {
    return new Promise((resolve) => {
      const totalParcels = Math.floor(totalPieces / piecesPerParcel)
      const remainder = totalPieces % piecesPerParcel
      
      // Layout parcels in a nice grid
      const parcelsPerRow = Math.min(totalParcels, 4)
      const rows = Math.ceil(totalParcels / parcelsPerRow)
      
      const spacing = 1.5
      const startX = -(parcelsPerRow - 1) * spacing / 2
      const startZ = -(rows - 1) * spacing / 2
      
      let animationsCompleted = 0
      const totalAnimations = totalParcels
      
      // Group pieces into parcels
      for (let parcelIdx = 0; parcelIdx < totalParcels; parcelIdx++) {
        const row = Math.floor(parcelIdx / parcelsPerRow)
        const col = parcelIdx % parcelsPerRow
        
        const parcelPosition = new THREE.Vector3(
          startX + col * spacing,
          0.4,
          startZ + row * spacing
        )
        
        // Create visual parcel (larger cube)
        const parcel = new THREE.Mesh(this.geometry, this.parcelMaterial.clone())
        parcel.position.copy(parcelPosition)
        parcel.scale.setScalar(1.2) // Larger for parcels
        parcel.visible = false // Start hidden
        
        const parcelInfo: CubeInfo = {
          mesh: parcel,
          id: parcelIdx,
          originalPosition: parcelPosition.clone(),
          group: 'parcel'
        }
        
        this.cubes.push(parcelInfo)
        this.sceneManager.getScene().add(parcel)
        
        // Animate pieces moving to parcel position
        const startPieceIdx = parcelIdx * piecesPerParcel
        for (let i = 0; i < piecesPerParcel; i++) {
          const pieceIdx = startPieceIdx + i
          const servingCubeIdx = this.cubes.findIndex(c => c.group === 'serving' && c.id === pieceIdx)
          
          if (servingCubeIdx >= 0) {
            const piece = this.cubes[servingCubeIdx].mesh
            
            this.animateMovement(
              piece,
              parcelPosition,
              600,
              i * 100,
              () => {
                piece.visible = false // Hide piece when it reaches parcel
                
                // Show parcel when last piece arrives
                if (i === piecesPerParcel - 1) {
                  parcel.visible = true
                  parcel.scale.setScalar(0)
                  this.animateCubeIn(parcel, 0)
                  
                  animationsCompleted++
                  if (animationsCompleted === totalAnimations) {
                    resolve()
                  }
                }
              }
            )
          }
        }
      }
      
      // Handle remainder pieces (show them separately)
      if (remainder > 0) {
        console.log(`${remainder} pieces remaining (not enough for a full parcel)`)
      }
    })
  }

  /**
   * Animate cube scaling in
   */
  private animateCubeIn(cube: THREE.Mesh, delay: number): void {
    setTimeout(() => {
      const startTime = Date.now()
      const duration = 400
      const targetScale = cube.scale.x || 1
      
      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        
        // Bounce easing
        const easeOut = 1 - Math.pow(1 - progress, 3)
        cube.scale.setScalar(easeOut * targetScale)
        
        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }
      
      animate()
    }, delay)
  }

  /**
   * Animate cube movement with arc
   */
  private animateMovement(cube: THREE.Mesh, targetPos: THREE.Vector3, duration: number, delay: number, onComplete?: () => void): void {
    setTimeout(() => {
      const startPos = cube.position.clone()
      const startTime = Date.now()
      
      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        
        // Ease in-out
        const easeInOut = progress < 0.5 
          ? 2 * progress * progress 
          : -1 + (4 - 2 * progress) * progress
        
        // Linear interpolation with slight arc
        cube.position.lerpVectors(startPos, targetPos, easeInOut)
        cube.position.y += Math.sin(progress * Math.PI) * 0.5 // Arc motion
        
        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          cube.position.copy(targetPos)
          onComplete?.()
        }
      }
      
      animate()
    }, delay)
  }

  private startRenderLoop(): void {
    const render = () => {
      this.sceneManager.render()
      this.animationId = requestAnimationFrame(render)
    }
    render()
  }

  public clearVisualization(): void {
    this.cubes = []
    this.sceneManager.clearScene()
  }

  public destroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
    }
    this.clearVisualization()
    this.sceneManager.destroy()
  }
}