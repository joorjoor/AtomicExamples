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

using System.Linq;

using AtomicEngine;

namespace FeatureExamples
{
    public class SkeletalAnimationSample : Sample
    {
        Camera camera;
        bool drawDebug;

        public SkeletalAnimationSample() : base() { }

        void CreateScene()
        {
            var cache = GetSubsystem<ResourceCache>();
            scene = new Scene();

            // Create the Octree component to the scene so that drawable objects can be rendered. Use default volume
            // (-1000, -1000, -1000) to (1000, 1000, 1000)
            scene.CreateComponent<Octree>();
            scene.CreateComponent<DebugRenderer>();

            // Create scene node & StaticModel component for showing a static plane
            var planeNode = scene.CreateChild("Plane");
            planeNode.Scale = new Vector3(100, 1, 100);
            var planeObject = planeNode.CreateComponent<StaticModel>();
            planeObject.Model = cache.Get<Model>("Models/Plane.mdl");
            planeObject.SetMaterial(cache.Get<Material>("Materials/StoneTiled.xml"));

            // Create a Zone component for ambient lighting & fog control
            var zoneNode = scene.CreateChild("Zone");
            var zone = zoneNode.CreateComponent<Zone>();

            // Set same volume as the Octree, set a close bluish fog and some ambient light
            zone.SetBoundingBox(new BoundingBox(-1000.0f, 1000.0f));
            zone.AmbientColor = new Color(0.15f, 0.15f, 0.15f);
            zone.FogColor = new Color(0.5f, 0.5f, 0.7f);
            zone.FogStart = 100;
            zone.FogEnd = 300;

            // Create a directional light to the world. Enable cascaded shadows on it
            var lightNode = scene.CreateChild("DirectionalLight");
            lightNode.SetDirection(new Vector3(0.6f, -1.0f, 0.8f));
            var light = lightNode.CreateComponent<Light>();
            light.LightType = LightType.LIGHT_DIRECTIONAL;
            light.CastShadows = true;

            light.ShadowBias = new BiasParameters(0.00025f, 0.5f);

            // Set cascade splits at 10, 50 and 200 world units, fade shadows out at 80% of maximum shadow distance
            light.ShadowCascade = new CascadeParameters(10.0f, 50.0f, 200.0f, 0.0f, 0.8f);

            // Create animated models
            const int numModels = 100;
            const float modelMoveSpeed = 2.0f;
            const float modelRotateSpeed = 100.0f;
            var bounds = new BoundingBox(new Vector3(-47.0f, 0.0f, -47.0f), new Vector3(47.0f, 0.0f, 47.0f));

            for (var i = 0; i < numModels; ++i)
            {
                var modelNode = scene.CreateChild("Jack");
                modelNode.Position = new Vector3(NextRandom(-45, 45), 0.0f, NextRandom(-45, 45));
                modelNode.Rotation = new Quaternion(0, NextRandom(0, 360), 0);
                //var modelObject = modelNode.CreateComponent<AnimatedModel>();
                var modelObject = new AnimatedModel();
                modelNode.AddComponent(modelObject);
                modelObject.Model = cache.Get<Model>("Models/Jack.mdl");
                //modelObject.Material = cache.GetMaterial("Materials/Jack.xml");
                modelObject.CastShadows = true;

                // Create an AnimationState for a walk animation. Its time position will need to be manually updated to advance the
                // animation, The alternative would be to use an AnimationController component which updates the animation automatically,
                // but we need to update the model's position manually in any case
                var walkAnimation = cache.Get<Animation>("Models/Jack_Walk.ani");
                var state = modelObject.AddAnimationState(walkAnimation);
                // The state would fail to create (return null) if the animation was not found
                if (state != null)
                {
                    // Enable full blending weight and looping
                    state.Weight = 1;
                    state.Looped = true;
                }

                // Create our custom Mover component that will move & animate the model during each frame's update
                var mover = new Mover(modelMoveSpeed, modelRotateSpeed, bounds);
                modelNode.AddComponent(mover);
            }

            // Create the camera. Limit far clip distance to match the fog
            CameraNode = scene.CreateChild("Camera");
            camera = CameraNode.CreateComponent<Camera>();
            camera.FarClip = 300;

            // Set an initial position for the camera scene node above the plane
            CameraNode.Position = new Vector3(0.0f, 5.0f, 0.0f);
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

            var input = GetSubsystem<Input>();
            if (input.GetKeyPress(Constants.KEY_SPACE))
                drawDebug = !drawDebug;
        }

        void SubscribeToEvents()
        {
            // Subscribe HandlePostRenderUpdate() function for
            // processing the post-render update event, sent after
            // Renderer subsystem is done with defining the draw
            // calls for the viewports (but before actually
            // executing them.) We will request debug geometry
            // rendering during that event

            SubscribeToEvent<PostRenderUpdateEvent>(e =>
            {
                // If draw debug mode is enabled, draw viewport debug geometry, which will show eg. drawable bounding boxes and skeleton
                // bones. Note that debug geometry has to be separately requested each frame. Disable depth test so that we can see the
                // bones properly
                if (drawDebug)
                {
                    GetSubsystem<Renderer>().DrawDebugGeometry(false);
                }
            });
        }

        public override void Start()
        {
            base.Start();
            CreateScene();
            SimpleCreateInstructionsWithWasd("\nSpace to toggle debug geometry");
            SetupViewport();
            SubscribeToEvents();
        }

        // protected override string JoystickLayoutPatch => JoystickLayoutPatches.WithDebugButton;


        class Mover : CSComponent
        {
            float MoveSpeed { get; }
            float RotationSpeed { get; }
            BoundingBox Bounds { get; }

            AnimationState animState;

            public Mover(float moveSpeed, float rotateSpeed, BoundingBox bounds)
            {
                MoveSpeed = moveSpeed;
                RotationSpeed = rotateSpeed;
                Bounds = bounds;
            }

            void Start()
            {
                // Get the model's first (only) animation
                // state and advance its time. Note the
                // convenience accessor to other components in
                // the same scene node

                var model = GetComponent<AnimatedModel>();

                if (model.NumAnimationStates > 0)
                {
                    animState = model.AnimationStates.First();
                }

            }

            void Update(float timeStep)
            {
                // This moves the character position
                Node.Translate(Vector3.UnitZ * MoveSpeed * timeStep, TransformSpace.TS_LOCAL);

                // If in risk of going outside the plane, rotate the model right
                var pos = Node.Position;
                if (pos.X < Bounds.Min.X || pos.X > Bounds.Max.X || pos.Z < Bounds.Min.Z || pos.Z > Bounds.Max.Z)
                    Node.Yaw(RotationSpeed * timeStep, TransformSpace.TS_LOCAL);

                if (animState != null)
                    animState.AddTime(timeStep);

            }
        }
    }
}