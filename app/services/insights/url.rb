module Insights
  class Url
    def self.create_short_url(path, user = nil)
      insights_url = InsightsUrl.create code: SecureRandom.urlsafe_base64,
                                        path: path,
                                        user: user
      "/url/#{insights_url.code}"
    end
  end
end
