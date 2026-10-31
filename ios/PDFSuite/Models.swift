import Foundation

struct UserDto: Codable, Identifiable {
    let id: Int
    let phoneNumber: String?
    let email: String?
    let role: String
    let tokensBalance: Int?
    let isPremium: Bool
    let quota: QuotaDto?
    
    enum CodingKeys: String, CodingKey {
        case id
        case phoneNumber = "phone_number"
        case email
        case role
        case tokensBalance = "tokens_balance"
        case isPremium = "is_premium"
        case quota
    }
}

struct TokenStatusResponse: Codable {
    let tokensBalance: Int
    let isSuperAdmin: Bool
    let tasks: [TaskItemDto]
    
    enum CodingKeys: String, CodingKey {
        case tokensBalance = "tokens_balance"
        case isSuperAdmin = "is_super_admin"
        case tasks
    }
}

struct TaskItemDto: Codable, Identifiable {
    let id: String
    let title: String
    let titleMl: String
    let rewardTokens: Int
    let badge: String
    let description: String
    let descriptionMl: String
    let isClaimed: Bool?
    
    enum CodingKeys: String, CodingKey {
        case id
        case title
        case titleMl = "title_ml"
        case rewardTokens = "reward_tokens"
        case badge
        case description
        case descriptionMl = "description_ml"
        case isClaimed = "is_claimed"
    }
}

struct ClaimTaskResponse: Codable {
    let status: String
    let tokensEarned: Int
    let tokensBalance: Int
    let message: String
    let messageMl: String?
    
    enum CodingKeys: String, CodingKey {
        case status
        case tokensEarned = "tokens_earned"
        case tokensBalance = "tokens_balance"
        case message
        case messageMl = "message_ml"
    }
}

struct QuotaDto: Codable {
    let limit: Int
    let usedToday: Int
    let remainingToday: Int
    
    enum CodingKeys: String, CodingKey {
        case limit
        case usedToday = "used_today"
        case remainingToday = "remaining_today"
    }
}

struct AuthResponse: Codable {
    let accessToken: String
    let tokenType: String
    let user: UserDto
    
    enum CodingKeys: String, CodingKey {
        case accessToken = "access_token"
        case tokenType = "token_type"
        case user
    }
}

struct ConversionResponse: Codable {
    let status: String
    let taskId: Int
    let filename: String
    let downloadUrl: String
    let fileSize: Int
    
    enum CodingKeys: String, CodingKey {
        case status
        case taskId = "task_id"
        case filename
        case downloadUrl = "download_url"
        case fileSize = "file_size"
    }
}
