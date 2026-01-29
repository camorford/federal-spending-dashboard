class ImportAwardsJob
  include Sidekiq::Job

  sidekiq_options queue: 'default', retry: 3

  def perform(pages = 5)
    AwardImporter.new.import(pages: pages)
  end
end
