import { Group, SpotLight, AmbientLight, HemisphereLight, DirectionalLight } from 'three';

class BasicLights extends Group {
    constructor(...args) {
        // Invoke parent Group() constructor with our args
        super(...args);

        const dir = new SpotLight(0xffffff, 1.6, 7, 0.8, 1, 1);
        const ambi = new AmbientLight(0x404040, 0.75);
        const hemi = new HemisphereLight(0xffffff, 0x080820, 0.5);
        const directionalLight1 = new DirectionalLight(0xffffff, 1);
        // const directionalLight2 = new DirectionalLight(0xffffff, 1);
        // const directionalLight3 = new DirectionalLight(0xffffff, 1);
        directionalLight1.position.set(0,30,-13);
        // directionalLight2.position.set(0,10,-13);
        // directionalLight3.position.set(0,3,-13);
        dir.position.set(5, 1, 2);
        dir.target.position.set(0, 0, 0);

        this.add(ambi, dir, hemi, directionalLight1);
    }
}

export default BasicLights;
