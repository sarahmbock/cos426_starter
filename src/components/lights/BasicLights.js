import { Group, SpotLight, AmbientLight, HemisphereLight, DirectionalLight } from 'three';

class BasicLights extends Group {
    constructor(...args) {
        // Invoke parent Group() constructor with our args
        super(...args);

        const ambi = new AmbientLight(0x404040, 1);
        const hemi = new HemisphereLight(0xffffff, 0x080820, 0.75);
        const directionalLight1 = new DirectionalLight(0xffffff, 1);
        directionalLight1.position.set(0,20,-13);

        //dir.position.set(5, 1, 2);
        //dir.target.position.set(0, 0, 0);

        this.add(ambi, hemi, directionalLight1);
    }
}

export default BasicLights;
