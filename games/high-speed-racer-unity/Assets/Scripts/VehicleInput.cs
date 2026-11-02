using UnityEngine;

namespace CityOfLegends
{
    public sealed class VehicleInput : MonoBehaviour
    {
        public float Steer { get; private set; }
        public float Throttle { get; private set; }
        public float Brake { get; private set; }

        // Screen space starts at the bottom left; GUI coordinates start at the top left.
        private const float Gap = 8f;
        private static float ButtonSize => Mathf.Min(84f, Mathf.Max(1f, (Screen.safeArea.width - 5f * Gap) / 4f));
        private static float BottomY => Screen.height - Screen.safeArea.yMin - ButtonSize - Gap;
        public static Rect LeftArea => new Rect(Screen.safeArea.xMin + Gap, BottomY, ButtonSize, ButtonSize);
        public static Rect RightArea => new Rect(Screen.safeArea.xMin + 2f * Gap + ButtonSize, BottomY, ButtonSize, ButtonSize);
        public static Rect BrakeArea => new Rect(Screen.safeArea.xMax - 2f * Gap - 2f * ButtonSize, BottomY, ButtonSize, ButtonSize);
        public static Rect ThrottleArea => new Rect(Screen.safeArea.xMax - Gap - ButtonSize, BottomY, ButtonSize, ButtonSize);

        private void Update()
        {
            float steer = 0;
            float throttle = 0;
            float brake = 0;
            if (Input.GetKey(KeyCode.A) || Input.GetKey(KeyCode.LeftArrow)) steer -= 1;
            if (Input.GetKey(KeyCode.D) || Input.GetKey(KeyCode.RightArrow)) steer += 1;
            if (Input.GetKey(KeyCode.W) || Input.GetKey(KeyCode.UpArrow)) throttle = 1;
            if (Input.GetKey(KeyCode.S) || Input.GetKey(KeyCode.DownArrow)) brake = 1;

            for (int i = 0; i < Input.touchCount; i++)
            {
                Touch touch = Input.GetTouch(i);
                if (touch.phase == TouchPhase.Ended || touch.phase == TouchPhase.Canceled) continue;
                Vector2 position = new Vector2(touch.position.x, Screen.height - touch.position.y);
                if (LeftArea.Contains(position)) steer -= 1;
                if (RightArea.Contains(position)) steer += 1;
                if (BrakeArea.Contains(position)) brake = 1;
                if (ThrottleArea.Contains(position)) throttle = 1;
            }
            Steer = Mathf.Clamp(steer, -1, 1);
            Throttle = Mathf.Clamp01(throttle);
            Brake = Mathf.Clamp01(brake);
        }

        private void OnApplicationFocus(bool focused)
        {
            if (!focused) { Steer = 0; Throttle = 0; Brake = 0; }
        }
    }
}
