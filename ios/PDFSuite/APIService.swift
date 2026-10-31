import Foundation

class APIService: ObservableObject {
    static let shared = APIService()
    let baseURL = "http://127.0.0.1:8000"
    
    @Published var token: String? = UserDefaults.standard.string(forKey: "jwt_token")
    @Published var currentUser: UserDto? = nil
    
    func saveToken(_ newToken: String) {
        self.token = newToken
        UserDefaults.standard.set(newToken, forKey: "jwt_token")
    }
    
    func logout() {
        self.token = nil
        self.currentUser = nil
        UserDefaults.standard.removeObject(forKey: "jwt_token")
    }
    
    func emailLogin(email: String, password: String) async throws -> UserDto {
        let url = URL(string: "\(baseURL)/api/v1/auth/email-login")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        let body = ["email": email.trimmingCharacters(in: .whitespacesAndNewlines), "password": password.trimmingCharacters(in: .whitespacesAndNewlines)]
        request.httpBody = try JSONSerialization.data(withJSONObject: body)
        
        let (data, response) = try await URLSession.shared.data(for: request)
        if let httpRes = response as? HTTPURLResponse, httpRes.statusCode >= 400 {
            let errorJson = try? JSONSerialization.jsonObject(with: data) as? [String: Any]
            let detail = errorJson?["detail"] as? String ?? "Authentication failed (\(httpRes.statusCode))"
            throw NSError(domain: "PDFSuiteAuth", code: httpRes.statusCode, userInfo: [NSLocalizedDescriptionKey: detail])
        }
        
        let auth = try JSONDecoder().decode(AuthResponse.self, from: data)
        await MainActor.run {
            self.saveToken(auth.accessToken)
            self.currentUser = auth.user
        }
        return auth.user
    }

    func sendOtp(phoneNumber: String) async throws -> String {
        let url = URL(string: "\(baseURL)/api/v1/auth/send-otp")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        let body = ["phone_number": phoneNumber]
        request.httpBody = try JSONSerialization.data(withJSONObject: body)
        
        let (data, _) = try await URLSession.shared.data(for: request)
        let json = try JSONSerialization.jsonObject(with: data) as? [String: Any]
        return json?["debug_otp"] as? String ?? "123456"
    }
    
    func verifyOtp(phoneNumber: String, otp: String) async throws -> UserDto {
        let url = URL(string: "\(baseURL)/api/v1/auth/verify-otp")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        let body = ["phone_number": phoneNumber, "otp": otp]
        request.httpBody = try JSONSerialization.data(withJSONObject: body)
        
        let (data, _) = try await URLSession.shared.data(for: request)
        let auth = try JSONDecoder().decode(AuthResponse.self, from: data)
        await MainActor.run {
            self.saveToken(auth.accessToken)
            self.currentUser = auth.user
        }
        return auth.user
    }
    
    func convertImagesToPdf(imagesData: [Data]) async throws -> ConversionResponse {
        let url = URL(string: "\(baseURL)/api/v1/convert/image-to-pdf")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        
        let boundary = UUID().uuidString
        request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")
        if let token = self.token {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        
        var body = Data()
        for (index, imgData) in imagesData.enumerated() {
            body.append("--\(boundary)\r\n".data(using: .utf8)!)
            body.append("Content-Disposition: form-data; name=\"files\"; filename=\"img_\(index).jpg\"\r\n".data(using: .utf8)!)
            body.append("Content-Type: image/jpeg\r\n\r\n".data(using: .utf8)!)
            body.append(imgData)
            body.append("\r\n".data(using: .utf8)!)
        }
        body.append("--\(boundary)--\r\n".data(using: .utf8)!)
        request.httpBody = body
        
        let (data, _) = try await URLSession.shared.data(for: request)
        return try JSONDecoder().decode(ConversionResponse.self, from: data)
    }
}
