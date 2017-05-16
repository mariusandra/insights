class Decorator
  def self.attributes(*args)
    @@attributes ||= {}
    @@attributes[self.to_s] = args
  end

  def self.context(*args)
    @@context ||= {}
    @@context[self.to_s] = args
  end

  def self.returns(key)
    @@returns ||= {}
    @@returns[self.to_s] = key
  end

  def initialize(object, args = {})
    @object = object
    @context_keys = @@context[self.class.to_s] || []
    @context = {}

    @context_keys.each do |key|
      @context[key] = args[key]
    end
  end

  def method_missing(m)
    if @context_keys.include?(m)
      @context[m]
    else
      raise NoMethodError(m)
    end
  end

  def object
    @object
  end

  def scope
    @scope
  end

  def context
    @context
  end

  def as_json
    if @@returns[self.class.to_s]
      self.send(@@returns[self.class.to_s])
    else
      @@attributes[self.class.to_s].map { |a| [a.to_s.camelize(:lower).to_sym, self.respond_to?(a) ? self.send(a) : object.send(a)] }.to_h
    end
  end

  def self.decorate(object, args = {})
    self.new(object, args).as_json
  end
end
