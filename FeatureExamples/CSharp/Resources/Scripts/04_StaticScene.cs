//
// Copyright (c) 2008-2015 the Urho3D project.
// Copyright (c) 2015 Xamarin Inc
// Copyright (c) 2016 THUNDERBEAST GAMES LLC
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//

using System;

using AtomicEngine;

namespace FeatureExamples
{

    public class StaticSceneSample : Sample
    {
        Camera camera;
        
        public StaticSceneSample() : base() { }

        public override void Start()
        {
            base.Start();
            CreateScene();
            SimpleCreateInstructionsWithWasd();
            SetupViewport();
        }

        void CreateScene()
        {
            var cache = GetSubsystem<ResourceCache>();

            scene = new Scene();

            // Create the Octree component to the scene. This is required before adding any drawable components, or else nothing will
            // show up. The default octree volume will be from (-1000, -1000, -1000) to (1000, 1000, 1000) in world coordinates; it
            // is also legal to place objects outside the volume but their visibility can then not be checked in a hierarchically
            // optimizing manner
            scene.CreateComponent<Octree>();

            // Create a child scene node (at world origin) and a StaticModel component into it. Set the StaticModel to show a simple
            // plane mesh with a "stone" material. Note that naming the scene nodes is optional. Scale the scene node larger
            // (100 x 100 world units)
            var planeNode = scene.CreateChild("Plane");
            planeNode.Scale = new Vector3(100, 1, 100);
            var planeObject = planeNode.CreateComponent<StaticModel>();
            planeObject.Model = cache.Get<Model>("Models/Plane.mdl");
            planeObject.SetMaterial(cache.Get<Material>("Materials/StoneTiled.xml"));

            // Create a directional light to the world so that we can see something. The light scene node's orientation controls the
            // light direction; we will use the SetDirection() function which calculates the orientation from a forward direction vector.
            // The light will use default settings (white light, no shadows)
            var lightNode = scene.CreateChild("DirectionalLight");
            lightNode.SetDirection(new Vector3(0.6f, -1.0f, 0.8f)); // The direction vector does not need to be normalized
            var light = lightNode.CreateComponent<Light>();
            light.LightType = LightType.LIGHT_DIRECTIONAL;

            var rand = new Random();
            for (int i = 0; i < 200; i++)
            {
                var mushroom = scene.CreateChild("Mushroom");
                mushroom.Position = new Vector3(rand.Next(90) - 45, 0, rand.Next(90) - 45);
                mushroom.Rotation = new Quaternion(0, rand.Next(360), 0);
                mushroom.SetScale(0.5f + rand.Next(20000) / 10000.0f);
                var mushroomObject = mushroom.CreateComponent<StaticModel>();
                mushroomObject.Model = cache.Get<Model>("Models/Mushroom.mdl");
                mushroomObject.SetMaterial(cache.Get<Material>("Materials/Mushroom.xml"));
            }

            CameraNode = scene.CreateChild("camera");
            camera = CameraNode.CreateComponent<Camera>();
            CameraNode.Position = new Vector3(0, 5, 0);
        }

        void SetupViewport()
        {
            var renderer = GetSubsystem<Renderer>();
            renderer.SetViewport(0, new Viewport(scene, camera));
        }

        protected override void Update(float timeStep)
        {
            base.Update(timeStep);
            SimpleMoveCamera3D(timeStep);
        }
    }
}