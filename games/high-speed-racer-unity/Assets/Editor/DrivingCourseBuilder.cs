using System.IO;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using CityOfLegends;

public static class DrivingCourseBuilder
{
    private const string ScenePath = "Assets/Scenes/DrivingCourse.unity";

    [MenuItem("City of Legends/Create driving course")]
    public static void CreateCourse()
    {
        Directory.CreateDirectory("Assets/Scenes");
        var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
        new GameObject("Driving course").AddComponent<DrivingCourse>();
        if (!EditorSceneManager.SaveScene(scene, ScenePath)) throw new System.Exception("Could not save driving course scene.");
        EditorBuildSettings.scenes = new[] { new EditorBuildSettingsScene(ScenePath, true) };
        AssetDatabase.SaveAssets();
    }

    // Intended for Unity's -batchmode -executeMethod workflow once Web Build Support is installed.
    public static void BuildWeb()
    {
        CreateCourse();
        var options = new BuildPlayerOptions {
            scenes = new[] { ScenePath },
            locationPathName = "Builds/Web",
            target = BuildTarget.WebGL,
            options = BuildOptions.None
        };
        var report = BuildPipeline.BuildPlayer(options);
        if (report.summary.result != UnityEditor.Build.Reporting.BuildResult.Succeeded)
            throw new System.Exception("Web build failed: " + report.summary.result);
    }
}
