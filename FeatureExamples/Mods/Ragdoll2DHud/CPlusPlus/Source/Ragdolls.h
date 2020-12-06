//
// Copyright (c) 2008-2016 the Urho3D project.
// Copyright (c) 2014-2016, THUNDERBEAST GAMES LLC All rights reserved
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

#pragma once

#include "Sample.h"

namespace Atomic
{

class Node;
class Scene;
class Sprite2D;

}

/// Ragdoll example.
/// This sample demonstrates:
///     - Detecting physics collisions
///     - Moving an AnimatedModel's bones with physics and connecting them with constraints
///     - Using rolling friction to stop rolling objects from moving infinitely
class Ragdolls : public Sample
{
    ATOMIC_OBJECT(Ragdolls, Sample)

public:
    /// Construct.
    Ragdolls(Context* context);

    /// Setup after engine initialization and before running the main loop.
    virtual void Start();

protected:

private:
    /// Construct the scene content.
    void CreateScene();
    /// Construct an instruction text to the UI.
    void CreateInstructions();
    /// Set up a viewport for displaying the scene.
    void SetupViewport();
    /// Subscribe to application-wide logic update and post-render update events.
    void SubscribeToEvents();
    /// Read input and moves the camera.
    void MoveCamera(float timeStep);
    /// Spawn a physics object from the camera position.
    void SpawnObject();
    /// Handle the logic update event.
    void HandleUpdate(StringHash eventType, VariantMap& eventData);
    /// Handle the post-render update event.
    void HandlePostRenderUpdate(StringHash eventType, VariantMap& eventData);

    /// Flag for drawing debug geometry.
    bool drawDebug_;
    
    // support for 2D hud and new features
    void CreateHUD();
    void RestartJacks();
    void CleanUpSome();
    void UpdateFps ();
    void UpdateMassHud ( int value );
    void UpdateSpeedHud ( int value );
    void UpdateSizeHud ( int value );
    
    // the  2nd scene for the hud "overlay"
    SharedPtr<Scene> hudScene;    // the hud scene
    SharedPtr<Camera> hudCamera;  // ortho cam for the (pixel perfect) hud
    Vector <Sprite2D*> filler;    // for bargraph display

    // more fun features...
    PODVector <float> bulletMass;   // how heavy the bullet is
    PODVector <float> bulletSpeed;  // how fast the bullet is
    PODVector <float> bulletSize;   // how big the bullet is
    int massCount, speedCount, sizeCount; // counters

    float bulletArc;    // shooting inclination

};
