module Insights
  class ExportModels
    def self.config_file
      "#{Rails.root}/config/insights.yml"
    end

    def self.load
      structure = YAML::load_file(config_file) rescue get_structure

      structure.select { |k, v| v['enabled'] }.map do |k, v|
        [k, v.merge({ 'columns' => v['columns'].select { |_, vv| vv.present? } })]
      end.to_h
    end

    def self.export
      input = YAML::load_file(config_file) rescue nil
      structure = get_structure.deep_stringify_keys
      output = {}

      if input.present?
        output = input.dup.deep_stringify_keys
        structure.each do |model_name, model_structure|
          # we already had this model in the output
          if output[model_name].present?
            model_structure.each do |key, value|
              if key == 'custom'
                next
              elsif key == 'columns' || key == 'aggregate'
                output[model_name][key] ||= {}
                value.each do |value_key, value_value|
                  existing = output[model_name][key][value_key]
                  if existing != false
                    output[model_name][key][value_key] = (existing || {}).merge(value_value)
                  end
                end
              elsif key != 'enabled'
                output[model_name][key] = value
              end
            end
          else
            output[model_name] = model_structure
          end
        end
      else
        output = structure
      end

      File.open(config_file, 'w') {|f| f.write output.deep_stringify_keys.to_yaml }
    end

    def self.get_structure
      Rails.application.eager_load! if Rails.env.development?

      models = ApplicationRecord.descendants

      models.map do |model|
        begin
          columns_hash = model.columns_hash
        rescue
          next
        end

        model_structure = {
          enabled: true,
          model: model.to_s,
          table_name: model.table_name,
          primary_key: model.primary_key,
          columns: columns_hash.map do |key, column|
            obj = if column.type.in? %i(datetime date)
                    { type: :time }
                  elsif column.type.in? %i(integer decimal float)
                    { type: :number }
                  elsif column.type.in? %i(string text)
                    { type: :string }
                  elsif column.type.in? %i(boolean)
                    { type: :boolean }
                  elsif column.type.in? %i(json)
                    { type: :payload }
                  elsif column.type.in? %i(geography)
                    { type: :geo }
                  else
                    puts "Warning! Unknown column type: :#{column.type} for #{model.to_s}, column #{key}"
                    { unknown: column.type }
                  end

            if key == model.primary_key
              obj[:index] = :primary_key
            end

            [key.to_sym, obj]
          end.to_h,
          custom: {},
          aggregate: {
            count: {
              sql: "count($$.#{model.primary_key})"
            }
          },
          links: {
            incoming: {},
            outgoing: {}
          }
        }

        model.reflections.each do |association_name, reflection|
          if reflection.macro == :belongs_to
            # reflection.class_name # User
            # reflection.foreign_key # user_id
            # reflection.association_primary_key # id

            model_structure[:columns].delete(reflection.foreign_key.to_sym)
            model_structure[:links][:outgoing][association_name] = {
              model: reflection.class_name,
              model_key: reflection.association_primary_key,
              my_key: reflection.foreign_key
            }
          elsif reflection.macro.in? %i(has_one has_many)
            # skip has_many :through associations
            if reflection.options.try(:[], :through).present?
              next
            end

            model_structure[:links][:incoming][association_name] = {
              model: reflection.class_name,
              model_key: reflection.foreign_key,
              my_key: reflection.association_primary_key
            }
          else
            puts "Warning! Unknown reflection :#{reflection.macro} for association #{association_name} on model #{model.to_s}"
          end
        end

        [model.to_s, model_structure]
      end.select(&:present?).sort_by { |k, v| k }.to_h.deep_stringify_keys
    end
  end
end
