import { Particle, SprayingParticle, GravitingParticle } from './particle.js'
import { Utils, Vector3 } from "../utils/utils.js"
import { generatePrefillTemplateForMeasured } from '../service/measuredTemplate.service.js'
import { AdvancedVariable } from './advancedVariable.js'
import { ParticleInput } from './particleInput.js'


export class ParticleTemplate { 

    static _translatePlaceableObject(source){
        let result

        if(Array.isArray(source)){
            result = []
            for(item of source){
                result.push(ParticleTemplate._translatePlaceableObject(item))
            }
        } else if (typeof source === 'string' && isNaN(source) && !source.includes('_')){
            result = Utils.getPlaceableObjectById(source)
        } else {
            result = source
        }

        return result
    }

    constructor(source, target, sizeStart, sizeEnd, particleRotationStart, particleRotationEnd,  
        particleLifetime, particleTexture,  colorStart, colorEnd, alphaStart, alphaEnd, 
        vibrationAmplitudeStart, vibrationAmplitudeEnd, vibrationFrequencyStart, vibrationFrequencyEnd, 
        advanced
        ){
        this.source = ParticleTemplate._translatePlaceableObject(source)   
        this.target = ParticleTemplate._translatePlaceableObject(target);                        
        this.sizeStart = Vector3.build(sizeStart);                 
        this.sizeEnd = Vector3.build(sizeEnd);  
        this.particleRotationStart = particleRotationStart;                 
        this.particleRotationEnd = particleRotationEnd;                     
        this.particleLifetime = particleLifetime; 
        this.particleTexture = particleTexture;   
        this.colorStart = Vector3.build(colorStart);               
        this.colorEnd = Vector3.build(colorEnd);                   
        this.alphaStart = alphaStart;               
        this.alphaEnd = alphaEnd;                   
        this.vibrationAmplitudeStart = vibrationAmplitudeStart
        this.vibrationAmplitudeEnd = vibrationAmplitudeEnd
        this.vibrationFrequencyStart = vibrationFrequencyStart
        this.vibrationFrequencyEnd = vibrationFrequencyEnd
        this.advanced = advanced
    }

    generateParticles(){
        let advancedVariable = AdvancedVariable.computeAdvancedVariables(this.advanced?.variables)

        let sourcePosition = Utils.getSourcePosition(Utils.getRandomValueFrom(this.source, advancedVariable))

        let sprite = new PIXI.Sprite(this.particleTexture)
        sprite.x = sourcePosition.x;
        sprite.y = sourcePosition.y;
        sprite.anchor.set(0.5);

        const startSizeInput = Utils.getRandomParticuleInputFrom(this.sizeStart, advancedVariable)
        let startSize = Vector3.build(startSizeInput)
        sprite.width = startSize.x;
        sprite.height = startSize.y;

        const angleStartInput = Utils.getRandomParticuleInputFrom(this.particleRotationStart, advancedVariable)
        sprite.angle = angleStartInput.add(sourcePosition.r).getValue()

        const colorStartInput = Utils.getRandomParticuleInputFrom(this.colorStart, advancedVariable)
        let colorStart = colorStartInput.getValue()
        sprite.tint = Color.fromRGB([Math.floor(colorStart.x)/255,Math.floor(colorStart.y)/255, Math.floor(colorStart.z)/255])

        return new Particle(
            sprite,
            Utils.getRandomValueFrom(this.particleLifetime, advancedVariable),
            startSizeInput,
            Vector3.build(Utils.getRandomParticuleInputFrom(this.sizeEnd, advancedVariable)),
            angleStartInput,
            Utils.getRandomParticuleInputFrom(this.particleRotationEnd, advancedVariable).add(sourcePosition.r),
            colorStartInput,
            Utils.getRandomParticuleInputFrom(this.colorEnd, advancedVariable),
            Utils.getRandomParticuleInputFrom(this.alphaStart, advancedVariable),
            Utils.getRandomParticuleInputFrom(this.alphaEnd, advancedVariable),
            Utils.getRandomParticuleInputFrom(this.vibrationAmplitudeStart, advancedVariable),
            Utils.getRandomParticuleInputFrom(this.vibrationAmplitudeEnd, advancedVariable),
            Utils.getRandomParticuleInputFrom(this.vibrationFrequencyStart, advancedVariable),
            Utils.getRandomParticuleInputFrom(this.vibrationFrequencyEnd, advancedVariable)
        )
    }
}

export class SprayingParticleTemplate extends ParticleTemplate{ 

    static getType(){
        return "Spraying"
    }

    static build(input, particleTexture){
        return new SprayingParticleTemplate(
            input.source,
            input.target,
            input.positionSpawning, 
            input.particleVelocityStart, 
            input.particleVelocityEnd, 
            input.particleAngleStart, 
            input.particleAngleEnd, 
            input.particleSizeStart,
            input.particleSizeEnd,
            input.particleRotationStart,
            input.particleRotationEnd,  
            input.particleLifetime, 
            particleTexture, 
            input.particleColorStart, 
            input.particleColorEnd,
            input.alphaStart, 
            input.alphaEnd,
            input.vibrationAmplitudeStart, 
            input.vibrationAmplitudeEnd,
            input.vibrationFrequencyStart, 
            input.vibrationFrequencyEnd,
            input.advanced,
            input.texture,
            );
    }

    constructor(source, target, positionSpawning, velocityStart, velocityEnd, angleStart, angleEnd, 
        sizeStart, sizeEnd, particleRotationStart, particleRotationEnd, particleLifetime, particleTexture, colorStart, colorEnd, alphaStart, alphaEnd, 
        vibrationAmplitudeStart, vibrationAmplitudeEnd, vibrationFrequencyStart, vibrationFrequencyEnd, advanced, texture= "none"){
        super(source, target, sizeStart, sizeEnd, particleRotationStart, particleRotationEnd, particleLifetime, particleTexture, colorStart, colorEnd, alphaStart, alphaEnd, vibrationAmplitudeStart, vibrationAmplitudeEnd, vibrationFrequencyStart, vibrationFrequencyEnd, advanced)
        this.positionSpawning = Vector3.build(positionSpawning);   
        this.velocityStart = velocityStart;         //Array of Number      
        this.velocityEnd = velocityEnd;             //Array of Number
        this.angleStart = angleStart;               //Array of Number      
        this.angleEnd = angleEnd;                   //Array of Number
        this.texture = texture;
    }

    generateParticles(){
        let advancedVariable = AdvancedVariable.computeAdvancedVariables(this.advanced?.variables)

        let particleProperties = Utils.getObjectRandomValueFrom(this, advancedVariable, true)

        let sourcePosition = Utils.getSourcePosition(particleProperties.source.getValue())
        let target = particleProperties.target.getValue()
        let particleLifetime = particleProperties.particleLifetime.getValue()
        let positionSpawning = particleProperties.positionSpawning.getValue()

        let targetAngleDirection
        if(this.texture != "none")
            this.particleTexture = PIXI.Texture.from(this.texture);
        if(target && (sourcePosition.x !== target.x || sourcePosition.y !== target.y)){
            //Target exist and is different than source
            let targetPosition = Utils.getSourcePosition(target)
            targetAngleDirection = Math.atan2(targetPosition.y - sourcePosition.y, targetPosition.x - sourcePosition.x)
            const oldPositionSpawning = new Vector3(positionSpawning.x, positionSpawning.y, 0);
            positionSpawning = oldPositionSpawning.rotateZVector(targetAngleDirection)

            //Upgrade particle lifetime if the target is longer than 5 grid
            let targetDistance = Math.sqrt(Math.pow(targetPosition.x - sourcePosition.x,2) + Math.pow(targetPosition.y - sourcePosition.y,2))
            if(targetDistance > 5 * canvas.scene.grid.size){
                particleLifetime *= (targetDistance/(5 * canvas.scene.grid.size)) 
            }
        } else if (this.source instanceof MeasuredTemplate){
            sourcePosition={x:this.source.x, y:this.source.y}//Don t use width and length
            let measuredOverride = generatePrefillTemplateForMeasured(this.source.document, particleProperties.velocityStart.getValue(), particleProperties.velocityEnd.getValue())
            particleProperties = {...particleProperties , ...measuredOverride}
            particleLifetime = particleProperties.particleLifetime.getValue()
            positionSpawning = particleProperties.positionSpawning.getValue()
            targetAngleDirection = 0
        } else {
            targetAngleDirection = sourcePosition.r  * Math.PI / 180
            const oldPositionSpawning = new Vector3(positionSpawning.x, positionSpawning.y, 0);
            positionSpawning = oldPositionSpawning.rotateZVector(targetAngleDirection)
        }

        let sprite = new PIXI.Sprite(this.particleTexture)
        sprite.x = sourcePosition.x + positionSpawning.x;
        sprite.y = sourcePosition.y + positionSpawning.y;
        sprite.anchor.set(0.5);

        let startSize = particleProperties.sizeStart.getValue()
        sprite.width = startSize.x;
        sprite.height = startSize.y;
        sprite.angle = particleProperties.particleRotationStart.getValue() +  targetAngleDirection * 180 / Math.PI

        let colorStart = Vector3.build(particleProperties.colorStart.getValue())
        sprite.tint = Color.fromRGB([Math.floor(colorStart.x)/255,Math.floor(colorStart.y)/255, Math.floor(colorStart.z)/255])

        return new SprayingParticle(
            advancedVariable,
            sprite,
            target,
            particleLifetime,
            particleProperties.velocityStart,
            particleProperties.velocityEnd,
            particleProperties.angleStart.add(targetAngleDirection * 180 / Math.PI),
            particleProperties.angleEnd.add(targetAngleDirection * 180 / Math.PI),
            particleProperties.sizeStart,
            particleProperties.sizeEnd,
            particleProperties.particleRotationStart.add(targetAngleDirection * 180 / Math.PI),
            particleProperties.particleRotationEnd.add(targetAngleDirection * 180 / Math.PI),
            particleProperties.colorStart,
            particleProperties.colorEnd,
            particleProperties.alphaStart,
            particleProperties.alphaEnd,
            particleProperties.vibrationAmplitudeStart,
            particleProperties.vibrationAmplitudeEnd,
            particleProperties.vibrationFrequencyStart,
            particleProperties.vibrationFrequencyEnd,
        )
    }
}


export class MissileParticleTemplate extends SprayingParticleTemplate { 

    static getType(){
        return "Missile"
    }

    constructor(source, target, positionSpawning, velocityStart, velocityEnd, angleStart, angleEnd, 
        sizeStart, sizeEnd, particleRotationStart, particleRotationEnd, particleLifetime, particleTexture, colorStart, colorEnd, alphaStart, alphaEnd, 
        vibrationAmplitudeStart, vibrationAmplitudeEnd, vibrationFrequencyStart, vibrationFrequencyEnd, advanced, subParticleTemplate){
        super(source, target, positionSpawning, velocityStart, velocityEnd, angleStart, angleEnd, 
            sizeStart, sizeEnd, particleRotationStart, particleRotationEnd, particleLifetime, particleTexture, colorStart, colorEnd, alphaStart, alphaEnd, 
            vibrationAmplitudeStart, vibrationAmplitudeEnd, vibrationFrequencyStart, vibrationFrequencyEnd, advanced)
        
        this.mainParticle = this.generateMainParticles()
        this.initGenerate = false

        this.subParticleTemplate = subParticleTemplate

        if(this.subParticleTemplate){
            this.subParticleTemplate.source = this.mainParticle.sprite
            this.subParticleTemplate.target = undefined
        }
    }

    generateMainParticles(){
        const mainParticle = super.generateParticles();

        if(mainParticle.target){
            const sourcePosition = {x:mainParticle.sprite.x, y:mainParticle.sprite.y}
            const targetPosition = Utils.getSourcePosition(mainParticle.target)

            if((sourcePosition.x === targetPosition.x && sourcePosition.y === targetPosition.y)){
                //Target and source is at the same place
                return mainParticle
            }

            //Missile must go to the target
            const targetAngleDirection = Math.atan2(targetPosition.y - sourcePosition.y, targetPosition.x - sourcePosition.x)
            mainParticle.angleStart = ParticleInput.build(targetAngleDirection * 180 / Math.PI)
            mainParticle.angleEnd = ParticleInput.build(targetAngleDirection * 180 / Math.PI)

            //The missile must stop at the target
            const targetDistance = Math.sqrt(Math.pow(targetPosition.x - sourcePosition.x,2) + Math.pow(targetPosition.y - sourcePosition.y,2))
            const averageVelocity = mainParticle.velocityEnd?.getValue() !== undefined ? (mainParticle.velocityStart?.getValue() + mainParticle.velocityEnd?.getValue()) /2 : mainParticle.velocityStart?.getValue()
            
            if(averageVelocity !== 0){
                const lifetime = 1000 * targetDistance/averageVelocity
                mainParticle.particleLifetime = lifetime
                mainParticle.remainingTime = lifetime
            }
        }


        return mainParticle;
    }

    generateParticles(){
        if( !this.initGenerate ) {
            //First init the main particles
            this.initGenerate = true
            return this.mainParticle
        }

        if(!this.subParticleTemplate){
            //No template for sub particles
            return
        }

        if(this.mainParticle === undefined){
            //Stop generating if main particle disapeared
            return
        }

        const sourcePosition = new Vector3(this.mainParticle.sprite.x, this.mainParticle.sprite.y, 0)

        const sourceDirection = this.mainParticle.getDirection()
        const sourceDirectionRadian = sourceDirection * Math.PI / 180

        let generatedParticle

        if(this.subParticleTemplate instanceof SprayingParticleTemplate){
            generatedParticle = this.subParticleTemplate.generateParticles()
       
            //The x axis is the backward direction of the main particle
            const dircetionXFactor = {
                x : - Math.cos(sourceDirectionRadian),
                y : - Math.sin(sourceDirectionRadian)
            }

            const dircetionYFactor = {
                x : - Math.sin(sourceDirectionRadian),
                y : Math.cos(sourceDirectionRadian)
            }

            //We change the spawning replacing the one without direction inside to a new one
            const generatedSprite = generatedParticle.sprite
            const oldPositionSpawning = {x: generatedSprite.x - sourcePosition.x, y: generatedSprite.y - sourcePosition.y}
            generatedSprite.x = sourcePosition.x + dircetionXFactor.x * oldPositionSpawning.x + dircetionYFactor.x * oldPositionSpawning.y;
            generatedSprite.y = sourcePosition.y + dircetionXFactor.y * oldPositionSpawning.x + dircetionYFactor.y * oldPositionSpawning.y;
            generatedParticle.positionVibrationLess = {x : generatedSprite.x, y : generatedSprite.y}; 

            //We change the angle to be the trail of the direction by default
            generatedParticle.angleStart.add(sourceDirection + 180) 
            generatedParticle.angleEnd.add(sourceDirection + 180) 
        } else if (this.subParticleTemplate instanceof GravitingParticleTemplate){
            generatedParticle = this.subParticleTemplate.generateParticles()
            generatedParticle.angle += sourceDirection + 180
        }

        return generatedParticle
    }
}

export class GravitingParticleTemplate extends ParticleTemplate { 

    static getType(){
        return "Graviting"
    }

    static build(input, particleTexture){
        return new GravitingParticleTemplate(
            input.source,
            input.target,
            input.particleAngleStart, 
            input.particleVelocityStart, 
            input.particleVelocityEnd, 
            input.particleRadiusStart, 
            input.particleRadiusEnd, 
            input.particleSizeStart,
            input.particleSizeEnd,
            input.particleRotationStart,
            input.particleRotationEnd,   
            input.particleLifetime, 
            particleTexture, 
            input.particleColorStart, 
            input.particleColorEnd,
            input.alphaStart, 
            input.alphaEnd,
            input.vibrationAmplitudeStart, 
            input.vibrationAmplitudeEnd,
            input.vibrationFrequencyStart, 
            input.vibrationFrequencyEnd,
            input.onlyEmitterFollow,
            input.advanced
            );
    }

    constructor(source, target, angleStart, angularVelocityStart, angularVelocityEnd, radiusStart, radiusEnd, 
        sizeStart, sizeEnd, particleRotationStart, particleRotationEnd, particleLifetime, particleTexture, colorStart, colorEnd, alphaStart, alphaEnd,
        vibrationAmplitudeStart, vibrationAmplitudeEnd, vibrationFrequencyStart, vibrationFrequencyEnd, onlyEmitterFollow, advanced){
        super(source, target, sizeStart, sizeEnd, particleRotationStart, particleRotationEnd, particleLifetime, particleTexture, colorStart, colorEnd, alphaStart, alphaEnd, vibrationAmplitudeStart, vibrationAmplitudeEnd, vibrationFrequencyStart, vibrationFrequencyEnd, advanced)
        
        this.angleStart = angleStart;                        //Array of Number
        this.angularVelocityStart = angularVelocityStart;  //Number      
        this.angularVelocityEnd = angularVelocityEnd;      //Number
        this.radiusStart = radiusStart;                     //Number      
        this.radiusEnd = radiusEnd;                         //Number
        this.onlyEmitterFollow = onlyEmitterFollow;         //Boolean
    }

    generateParticles(){
        const advancedVariable = AdvancedVariable.computeAdvancedVariables(this.advanced?.variables)

        const source = Utils.getRandomValueFrom(this.source, advancedVariable)
        const sourcePosition = Utils.getSourcePosition(source)

        const target = Utils.getRandomValueFrom(this.target, advancedVariable)
        const targetPosition = Utils.getSourcePosition(target)

        const angleOriginValue = targetPosition  && (sourcePosition.x !== this.target.x || sourcePosition.y !== this.target.y) ? Math.atan2(targetPosition.y - sourcePosition.y, targetPosition.x - sourcePosition.x) * 180 / Math.PI : sourcePosition.r
        const angleStart = Utils.getRandomValueFrom(this.angleStart, advancedVariable) + angleOriginValue
        const radiusStartInput = Utils.getRandomParticuleInputFrom(this.radiusStart, advancedVariable)
        let radiusStart = radiusStartInput.getValue()
        
        const sprite = new PIXI.Sprite(this.particleTexture)
        sprite.anchor.set(0.5);
        sprite.x = sourcePosition.x + Math.cos(angleStart * (Math.PI / 180)) * radiusStart;
        sprite.y = sourcePosition.y + Math.sin(angleStart * (Math.PI / 180)) * radiusStart;

        const startSizeInput = Utils.getRandomParticuleInputFrom(this.sizeStart, advancedVariable)
        let startSize = startSizeInput.getValue()
        sprite.width = startSize.x;
        sprite.height = startSize.y;

        const rotationStartInput = Utils.getRandomParticuleInputFrom(this.particleRotationStart, advancedVariable)
        sprite.angle = rotationStartInput.add(angleOriginValue).getValue()

        const colorStartInput = Utils.getRandomParticuleInputFrom(this.colorStart, advancedVariable)
        let colorStart = colorStartInput.getValue()
        sprite.tint = Color.fromRGB([Math.floor(colorStart.x)/255,Math.floor(colorStart.y)/255, Math.floor(colorStart.z)/255])

        return new GravitingParticle(
            advancedVariable,
            sprite,
            this.onlyEmitterFollow? sourcePosition : source,
            Utils.getRandomParticuleInputFrom(this.particleLifetime, advancedVariable).getValue(),
            angleStart,
            Utils.getRandomParticuleInputFrom(this.angularVelocityStart, advancedVariable),
            Utils.getRandomParticuleInputFrom(this.angularVelocityEnd, advancedVariable),
            radiusStartInput,
            Utils.getRandomParticuleInputFrom(this.radiusEnd, advancedVariable),
            startSizeInput,
            Utils.getRandomParticuleInputFrom(this.sizeEnd, advancedVariable),
            rotationStartInput,
            Utils.getRandomParticuleInputFrom(this.particleRotationEnd, advancedVariable).add(angleOriginValue),  
            colorStartInput,
            Utils.getRandomParticuleInputFrom(this.colorEnd, advancedVariable),
            Utils.getRandomParticuleInputFrom(this.alphaStart, advancedVariable),
            Utils.getRandomParticuleInputFrom(this.alphaEnd, advancedVariable),
            Utils.getRandomParticuleInputFrom(this.vibrationAmplitudeStart, advancedVariable),
            Utils.getRandomParticuleInputFrom(this.vibrationAmplitudeEnd, advancedVariable),
            Utils.getRandomParticuleInputFrom(this.vibrationFrequencyStart, advancedVariable),
            Utils.getRandomParticuleInputFrom(this.vibrationFrequencyEnd, advancedVariable)
        )
    }
}
class fakeMeasured{
    constructor(name, radius){
        this.t = name 
        this.distance = radius
    }
}
//Measure Templates applied to Tokens instead.
export class AreaParticleTemplate extends ParticleTemplate{ 

    static getType(){
        return "area"
    }
    static build(input, particleTexture){
        return new AreaParticleTemplate(
            input.source,
            input.target,
            input.positionSpawning, 
            input.particleVelocityStart, 
            input.particleVelocityEnd, 
            input.particleAngleStart, 
            input.particleAngleEnd, 
            input.particleSizeStart,
            input.particleSizeEnd,
            input.particleRotationStart,
            input.particleRotationEnd,  
            input.particleLifetime, 
            particleTexture, 
            input.particleColorStart, 
            input.particleColorEnd,
            input.alphaStart, 
            input.alphaEnd,
            input.vibrationAmplitudeStart, 
            input.vibrationAmplitudeEnd,
            input.vibrationFrequencyStart, 
            input.vibrationFrequencyEnd,
            input.advanced,
            input.radius,
            input.type,
            input.texture
            );
    }

    constructor(source, target, positionSpawning, velocityStart, velocityEnd, angleStart, angleEnd, 
        sizeStart, sizeEnd, particleRotationStart, particleRotationEnd, particleLifetime, particleTexture, colorStart, colorEnd, alphaStart, alphaEnd, 
        vibrationAmplitudeStart, vibrationAmplitudeEnd, vibrationFrequencyStart, vibrationFrequencyEnd, advanced, radius, type, texture = "none"){
        super(source, target, sizeStart, sizeEnd, particleRotationStart, particleRotationEnd, particleLifetime, particleTexture, colorStart, colorEnd, alphaStart, alphaEnd, vibrationAmplitudeStart, vibrationAmplitudeEnd, vibrationFrequencyStart, vibrationFrequencyEnd, advanced)
        this.positionSpawning = Vector3.build(positionSpawning);   
        this.velocityStart = velocityStart;         //Array of Number      
        this.velocityEnd = velocityEnd;             //Array of Number
        this.angleStart = angleStart;               //Array of Number      
        this.angleEnd = angleEnd;                   //Array of Number
        this.radius = radius;
        this.type = type;
        this.texture = texture
    }

    generateParticles(){
        let advancedVariable = AdvancedVariable.computeAdvancedVariables(this.advanced?.variables)

        let particleProperties = Utils.getObjectRandomValueFrom(this, advancedVariable, true)
        if(this.texture != "none")
            this.particleTexture = PIXI.Texture.from(this.texture);
        let sourcePosition = Utils.getSourcePosition(particleProperties.source.getValue())
        let target = particleProperties.target.getValue()
        let particleLifetime = particleProperties.particleLifetime.getValue()
        let positionSpawning = particleProperties.positionSpawning.getValue()
        let faketemplate = new fakeMeasured("area", this.radius)
        let targetAngleDirection
        //sourcePosition={x:this.source.x, y:this.source.y}//Don t use width and length
        let measuredOverride = generatePrefillTemplateForMeasured(faketemplate, particleProperties.velocityStart.getValue(), particleProperties.velocityEnd.getValue(), this.type)
        particleProperties = {...particleProperties , ...measuredOverride}
        particleLifetime = particleProperties.particleLifetime.getValue()
        positionSpawning = particleProperties.positionSpawning.getValue()
        targetAngleDirection = 0

        let sprite = new PIXI.Sprite(this.particleTexture)
        sprite.x = sourcePosition.x + positionSpawning.x;
        sprite.y = sourcePosition.y + positionSpawning.y;
        sprite.anchor.set(0.5);

        let startSize = particleProperties.sizeStart.getValue()
        sprite.width = startSize.x;
        sprite.height = startSize.y;
        sprite.angle = particleProperties.particleRotationStart.getValue() +  targetAngleDirection * 180 / Math.PI

        let colorStart = Vector3.build(particleProperties.colorStart.getValue())
        sprite.tint = Color.fromRGB([Math.floor(colorStart.x)/255,Math.floor(colorStart.y)/255, Math.floor(colorStart.z)/255])

        return new SprayingParticle(
            advancedVariable,
            sprite,
            target,
            particleLifetime,
            particleProperties.velocityStart,
            particleProperties.velocityEnd,
            particleProperties.angleStart.add(targetAngleDirection * 180 / Math.PI),
            particleProperties.angleEnd.add(targetAngleDirection * 180 / Math.PI),
            particleProperties.sizeStart,
            particleProperties.sizeEnd,
            particleProperties.particleRotationStart.add(targetAngleDirection * 180 / Math.PI),
            particleProperties.particleRotationEnd.add(targetAngleDirection * 180 / Math.PI),
            particleProperties.colorStart,
            particleProperties.colorEnd,
            particleProperties.alphaStart,
            particleProperties.alphaEnd,
            particleProperties.vibrationAmplitudeStart,
            particleProperties.vibrationAmplitudeEnd,
            particleProperties.vibrationFrequencyStart,
            particleProperties.vibrationFrequencyEnd,
        )
    }
}