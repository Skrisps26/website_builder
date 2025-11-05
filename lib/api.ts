const API_BASE_URL = process.env.NEXT_PUBLIC_AWS_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_AWS_API_KEY;

interface ChatResponse {
  projectId: string;
  executionArn: string;
}

interface StatusResponse {
  status: string;
  previewUrl?: string;
}

// AWS backend response structure
interface AWSBackendResponse {
  userId: string;
  projectId: string;
  prompt: string;
  build?: {
    Build?: {
      BuildStatus?: string;
      BuildComplete?: boolean;
    };
  };
  upload?: {
    previewUrl?: string;
  };
}

export async function chatAPI(prompt: string): Promise<ChatResponse> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    
    // Add API key if provided
    if (API_KEY) {
      headers["x-api-key"] = API_KEY;
    }
    
    const response = await fetch(`${API_BASE_URL}`, {
      method: "POST",
      headers,
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);  // ← Fixed
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Chat API error:", error);
    throw error;
  }
}

export async function checkProjectStatus(userId: string, projectId: string): Promise<StatusResponse> {
  try {
    const params = new URLSearchParams({
      userId,
      projectId,
    });

    const response = await fetch(`${API_BASE_URL}/project-status?${params.toString()}`, {  // ← Fixed
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);  // ← Fixed
    }

    const data: AWSBackendResponse = await response.json();
    
    // Transform AWS response to expected format
    const buildStatus = data.build?.Build?.BuildStatus;
    const buildComplete = data.build?.Build?.BuildComplete;
    const previewUrl = data.upload?.previewUrl;
    
    // Map build status to UI status
    let status = "PROCESSING";
    if (buildComplete && buildStatus === "SUCCEEDED" && previewUrl) {
      status = "PREVIEW_READY";
    } else if (buildStatus === "FAILED") {
      status = "FAILED";
    } else if (buildStatus === "IN_PROGRESS") {
      status = "BUILDING";
    }
    
    return {
      status,
      previewUrl,
    };
  } catch (error) {
    console.error("Status API error:", error);
    throw new Error("Failed to check project status");
  }
}