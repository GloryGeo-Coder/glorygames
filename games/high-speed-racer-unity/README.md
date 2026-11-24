# High Speed Racer: City of Legends — Unity workspace

This separate Unity 6.3 LTS project is the first driving foundation for the City of Legends rebuild. It does not replace or deploy the existing WebGameArena game.

## Current scope

- A generated, straight driving course with a finish line, simple barriers, checkpoints and recovery with a time penalty.
- A four-wheel `WheelCollider` vehicle with rear-wheel drive, speed-sensitive steering, braking, wheel visuals and collision slowdown. Vehicle condition never ends the drive.
- Keyboard controls: W/up accelerates, S/down brakes, A/D or arrow keys steer and R recovers. Touch controls support simultaneous steering and throttle on compatible browsers.
- A following camera, speed, condition and elapsed time display.

The geometry is temporary development geometry. This is not a recreation of the live game: career jobs, rivals, existing vehicles and environments, audio, the score bridge, save migration, a garage and production visuals are not yet integrated. No game or account data is migrated or changed by this workspace.

## Open and run

1. Install Unity Editor **6000.3.21f1** with **Web Build Support** using Unity Hub, and activate the appropriate Unity licence.
2. Open `games/high-speed-racer-unity` as a Unity project. Allow package import and compilation to finish.
3. Select **City of Legends → Create driving course**. This generates `Assets/Scenes/DrivingCourse.unity` and makes it the active build scene. Use an isolated working copy: invoking the command regenerates that scene and the build-scene list.
4. Open the generated scene and enter Play mode. Test steering, braking, collision slowdown, checkpoint recovery and touch controls.
5. For a Web build, use the Web build profile in Unity or run the Editor in batch mode with `-projectPath <absolute-project-path> -batchmode -quit -buildTarget WebGL -executeMethod DrivingCourseBuilder.BuildWeb`. The output is written to `Builds/Web` inside this project; serve it over HTTP(S) for testing.

The Editor and Web build have not been run in the current environment. The project and settings must be validated with this Editor version before relying on the commands or merging into a production release.

## Production integration gates

Keep the current game at `apps/web/public/games/high-spead-racer/` available throughout development. Build a separate preview entry only after the Unity build exists and its asset paths, loading, fullscreen, scores and browser headers are tested. Unity's compressed Web output requires appropriate response headers or an explicitly verified fallback. Test real Android and iOS devices for controls, WebGL support, memory and sustained performance before any production switch.

The next milestones are authored track geometry and vehicle tuning; rival driving and recoverable impacts; mission and garage systems; accessible mobile controls; audio; profile compatibility and platform score integration. Asset ownership and conversion of existing GLBs must be checked before importing them. Preserve the existing six jobs, twelve arcade streets and profile data until a separately tested migration is ready.
