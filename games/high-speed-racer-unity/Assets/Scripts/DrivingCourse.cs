using UnityEngine;

namespace CityOfLegends
{
    // This isolated course is generated locally; it is not part of the live game.
    public sealed class DrivingCourse : MonoBehaviour
    {
        private WheelVehicle vehicle;
        private const float StartZ = -390f;
        private const float FinishZ = 390f;
        private float checkpointZ = StartZ;
        private float elapsed;
        private bool finished;
        private int recoveries;

        private void Start()
        {
            RenderSettings.ambientLight = new Color(0.55f, 0.58f, 0.68f);
            GameObject lightObject = new GameObject("Sun");
            Light sun = lightObject.AddComponent<Light>();
            sun.type = LightType.Directional;
            sun.intensity = 1.1f;
            lightObject.transform.rotation = Quaternion.Euler(48, -35, 0);

            MakeBox("Road", new Vector3(0, -0.3f, 0), new Vector3(20, 0.6f, 820), new Color(0.12f, 0.14f, 0.18f));
            MakeBox("Left barrier", new Vector3(-10, 0.5f, 0), new Vector3(0.6f, 1, 820), new Color(0.28f, 0.3f, 0.35f));
            MakeBox("Right barrier", new Vector3(10, 0.5f, 0), new Vector3(0.6f, 1, 820), new Color(0.28f, 0.3f, 0.35f));
            for (int z = -390; z < 400; z += 20)
                MakeBox("Lane mark", new Vector3(0, 0.012f, z), new Vector3(0.14f, 0.025f, 8), Color.white, false);
            MakeBox("Finish", new Vector3(0, 0.03f, FinishZ), new Vector3(19, 0.03f, 1), Color.yellow, false);
            vehicle = BuildVehicle();

            GameObject cameraObject = new GameObject("Chase camera");
            cameraObject.tag = "MainCamera";
            cameraObject.AddComponent<Camera>();
            cameraObject.AddComponent<AudioListener>();
            cameraObject.transform.position = vehicle.transform.position + new Vector3(0, 4, -8);
            cameraObject.AddComponent<ChaseCamera>().target = vehicle.transform;
        }

        private WheelVehicle BuildVehicle()
        {
            GameObject car = new GameObject("Family Coupe");
            car.transform.position = new Vector3(0, 1.1f, StartZ);
            car.AddComponent<Rigidbody>();
            car.AddComponent<VehicleInput>();
            WheelVehicle controller = car.AddComponent<WheelVehicle>();
            GameObject body = MakeBox("Body", Vector3.zero, new Vector3(1.75f, 0.65f, 3.8f), new Color(0.08f, 0.32f, 0.68f));
            body.transform.SetParent(car.transform, false);
            GameObject roof = MakeBox("Cabin", Vector3.zero, new Vector3(1.45f, 0.45f, 1.75f), new Color(0.1f, 0.17f, 0.24f), false);
            roof.transform.SetParent(car.transform, false);
            roof.transform.localPosition = new Vector3(0, 0.48f, -0.15f);
            CreateWheel(car.transform, new Vector3(-0.85f, -0.35f, 1.25f), out controller.frontLeft, out controller.frontLeftVisual);
            CreateWheel(car.transform, new Vector3(0.85f, -0.35f, 1.25f), out controller.frontRight, out controller.frontRightVisual);
            CreateWheel(car.transform, new Vector3(-0.85f, -0.35f, -1.25f), out controller.rearLeft, out controller.rearLeftVisual);
            CreateWheel(car.transform, new Vector3(0.85f, -0.35f, -1.25f), out controller.rearRight, out controller.rearRightVisual);
            return controller;
        }

        private void CreateWheel(Transform car, Vector3 position, out WheelCollider wheel, out Transform visual)
        {
            GameObject wheelObject = new GameObject("Wheel collider");
            wheelObject.transform.SetParent(car, false);
            wheelObject.transform.localPosition = position;
            wheel = wheelObject.AddComponent<WheelCollider>();
            wheel.radius = 0.38f;
            wheel.suspensionDistance = 0.2f;
            JointSpring spring = wheel.suspensionSpring;
            spring.spring = 35000; spring.damper = 4500; spring.targetPosition = 0.5f;
            wheel.suspensionSpring = spring;
            GameObject wheelVisual = new GameObject("Wheel visual");
            visual = wheelVisual.transform;
            GameObject tyre = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            tyre.name = "Tyre";
            Destroy(tyre.GetComponent<Collider>());
            tyre.transform.SetParent(visual, false);
            tyre.transform.localRotation = Quaternion.Euler(0, 0, 90);
            tyre.transform.localScale = new Vector3(0.76f, 0.14f, 0.76f);
            tyre.GetComponent<Renderer>().material.color = new Color(0.08f, 0.08f, 0.09f);
        }

        private GameObject MakeBox(string name, Vector3 position, Vector3 size, Color color, bool collision = true)
        {
            GameObject obj = GameObject.CreatePrimitive(PrimitiveType.Cube);
            obj.name = name;
            obj.transform.position = position;
            obj.transform.localScale = size;
            obj.GetComponent<Renderer>().material.color = color;
            if (!collision) Destroy(obj.GetComponent<Collider>());
            return obj;
        }

        private void Update()
        {
            if (!vehicle) return;
            if (!finished) elapsed += Time.deltaTime;
            float z = vehicle.transform.position.z;
            if (z > checkpointZ + 100f) checkpointZ = Mathf.Min(FinishZ - 25f, checkpointZ + 100f);
            if (z >= FinishZ) finished = true;
            if (vehicle.transform.position.y < -10f) Recover();
            if (Input.GetKeyDown(KeyCode.R)) Recover();
        }

        private void Recover()
        {
            recoveries++;
            elapsed += 5f;
            vehicle.Recover(new Vector3(0, 1.1f, checkpointZ), Quaternion.identity);
        }

        private void OnGUI()
        {
            if (!vehicle) return;
            GUI.Box(new Rect(12, 12, 260, 90), $"Speed {vehicle.SpeedKph:0} km/h\nCondition {vehicle.Condition:0}%\nTime {elapsed:0.0}s · Recoveries {recoveries}");
            if (finished) GUI.Box(new Rect(Screen.width / 2f - 100, 20, 200, 40), "Course complete");
            if (GUI.Button(new Rect(Screen.width - 110, 12, 96, 48), "Recover")) Recover();
            GUI.Box(VehicleInput.LeftArea, "LEFT"); GUI.Box(VehicleInput.RightArea, "RIGHT");
            GUI.Box(VehicleInput.BrakeArea, "BRAKE"); GUI.Box(VehicleInput.ThrottleArea, "DRIVE");
        }
    }
}
