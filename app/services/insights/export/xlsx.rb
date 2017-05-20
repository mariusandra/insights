module Insights::Export
  class Xlsx < Common
    def filename
      "#{export_title}.xlsx"
    end

    def type
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    end

    def data
      @package = Axlsx::Package.new
      @package.workbook.add_worksheet(name: params[:export_title].present? ? "Results - #{params[:export_title]}"[0..30] : "Results") do |sheet|
        sheet.add_row response[:columns].map { |c| c.split('.')[1..-1].join('.') }
        response[:results].each do |row|
          sheet.add_row row
        end
      end

      if response[:graph].present?
        keys = [:time] + response[:graph][:keys]

        facet_keys = keys.select { |k| k.to_s.include?('$$') }
        facet_column_key = facet_keys.present? ? facet_keys.first.split('$$')[0] : nil
        skip = facet_column_key.present? ? facet_column_key.length + 2 : longest_common_prefix(keys).length

        @package.workbook.add_worksheet(name: params[:export_title].present? ? "Graph - #{params[:export_title]}"[0..30] : "Graph") do |sheet|
          sheet.add_row [:time] + response[:graph][:keys].map { |k| k[skip..-1] }
          response[:graph][:results].each do |row|
            sheet.add_row keys.map { |k| row[k] }
          end
        end
      end

      tempfile = Tempfile.new(['export-', '.xlsx'])
      @package.serialize(tempfile)

      File.read(tempfile)
    end
  end
end
