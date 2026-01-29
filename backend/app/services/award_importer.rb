class AwardImporter
  def initialize
    @client = UsaspendingClient.new
  end

  def import(pages: 5)
    return if SyncLog.currently_running?

    sync_log = SyncLog.create!(sync_type: 'incremental', status: 'pending')
    sync_log.start!

    total_records = 0

    begin
      pages.times do |page_num|
        response = @client.search_awards(page: page_num + 1, limit: 100)
        results = response['results'] || []

        break if results.empty?

        results.each do |award_data|
          import_award(award_data)
          total_records += 1
        end

        Rails.logger.info "Imported page #{page_num + 1}, total records: #{total_records}"
      end

      sync_log.complete!(total_records)
      Rails.logger.info "Import complete: #{total_records} records"

    rescue => e
      sync_log.fail!(e.message)
      Rails.logger.error "Import failed: #{e.message}"
      raise
    end
  end

  private

  def import_award(data)
    usaspending_id = data['Award ID']
    return if usaspending_id.blank?

    agency = find_or_create_agency(data['Awarding Agency'])
    recipient = find_or_create_recipient(data['Recipient Name'])

    Award.find_or_initialize_by(usaspending_id: usaspending_id).tap do |award|
      award.agency = agency
      award.recipient = recipient
      award.award_type = map_award_type(data['Contract Award Type'])
      award.amount = parse_amount(data['Award Amount'])
      award.description = data['Description']
      award.awarded_on = parse_date(data['Start Date'])
      award.place_of_performance_state = data['Place of Performance State Code']
      award.save!
    end
  end

  def find_or_create_agency(name)
    return nil if name.blank?

    Agency.find_or_create_by!(name: name) do |agency|
      agency.code = name.split.map(&:first).join.upcase[0..5]
    end
  end

  def find_or_create_recipient(name)
    return nil if name.blank?

    Recipient.find_or_create_by!(name: name)
  end

  def map_award_type(type)
    case type&.downcase
    when /contract/ then 'contract'
    when /grant/ then 'grant'
    when /loan/ then 'loan'
    when /direct payment/ then 'direct_payment'
    else 'other'
    end
  end

  def parse_amount(amount)
    amount.to_f.abs
  end

  def parse_date(date_str)
    Date.parse(date_str)
  rescue
    Date.today
  end
end
