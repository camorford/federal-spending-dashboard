class Agency < ApplicationRecord
  has_many :awards, dependent: :nullify

  validates :name, presence: true
  validates :code, presence: true, uniqueness: true

  def total_spending
    awards.sum(:amount)
  end

  def award_count
    awards.counts
  end
end
