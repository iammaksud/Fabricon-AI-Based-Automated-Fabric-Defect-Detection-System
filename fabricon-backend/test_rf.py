from inference_sdk import InferenceHTTPClient

client = InferenceHTTPClient(
    api_url="https://detect.roboflow.com",
    api_key="0bX79kCPtf4aJWTaoPMr",
)

result = client.infer(
    "sample.jpg",
    model_id="fabric-defect-dfetection1-vccmv/2",
)

print(result)